import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to parse date "7-Oct-22" -> Date object
function parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
}

// Helper to normalize batch names
function normalizeBatch(batchStr: string): { name: string, days: string, timeSlot: string, isOnline: boolean } | null {
    if (!batchStr) return null

    const parts = batchStr.split('-').map(p => p.trim().toUpperCase())
    let isOnline = false

    // Check Online
    if (parts[0] === 'O' || parts[0] === 'ONLINE') {
        isOnline = true
        parts.shift()
    }

    const dayMap: Record<string, string> = {
        'M': 'Mon',
        'T': 'Tue',
        'W': 'Wed',
        'TH': 'Thu',
        'F': 'Fri',
        'SAT': 'Sat',
        'SUN': 'Sun',
        'DAILY': 'Mon,Tue,Wed,Thu,Fri'
    }

    const daysSet = new Set<string>()
    const timeParts: string[] = []

    // Heuristic for T-T (Tue-Thu) vs T (Tue)
    // If we encounter 'T' twice, it's Tue and Thu.
    let tCount = 0

    // Pre-scan for T count if needed, but let's just iterate
    // Actually, simpler: map specific codes found in CSV
    // M-F -> Mon,Tue,Wed,Thu,Fri
    // T-T -> Tue,Thu
    // M-W -> Mon,Wed
    // SAT -> Sat
    // SUN -> Sun
    // DAILY -> Mon,Tue,Wed,Thu,Fri

    // Let's try to identify day tokens vs time tokens
    for (const p of parts) {
        if (p === 'DAILY') {
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(d => daysSet.add(d))
        } else if (p === 'M') daysSet.add('Mon')
        else if (p === 'W') daysSet.add('Wed')
        else if (p === 'F') daysSet.add('Fri')
        else if (p === 'SAT') daysSet.add('Sat')
        else if (p === 'SUN') daysSet.add('Sun')
        else if (p === 'TH') daysSet.add('Thu')
        else if (p === 'T') {
            tCount++
            if (tCount === 1) daysSet.add('Tue')
            else if (tCount === 2) daysSet.add('Thu')
        } else if (p === 'MT') {
            daysSet.add('Mon'); daysSet.add('Tue')
        } else if (p === 'MW') {
            daysSet.add('Mon'); daysSet.add('Wed')
        } else if (p === 'TT') {
            daysSet.add('Tue'); daysSet.add('Thu')
        } else if (!isNaN(parseInt(p)) || p.includes('PM') || p.includes('AM')) {
            timeParts.push(p)
        }
    }

    // Sort days
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const sortedDays = Array.from(daysSet).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))

    // Format Time
    let timeSlot = 'Unknown Time'
    if (timeParts.length > 0) {
        const formatTime = (t: string) => {
            if (t.includes('PM') || t.includes('AM')) return t
            const n = parseInt(t)
            // Assumption: 1-7 is PM, 8-12 is AM unless specified? 
            // Or maybe 7-8 is 7PM-8PM. 
            // Let's assume PM for small numbers < 8, AM for >= 8? 
            // Actually, "10-12" could be AM. "4-5" is PM.
            // Let's just append PM if it's < 8, else AM? 
            // 7-8 -> 7 PM - 8 PM
            // 10-11 -> 10 AM - 11 AM? Or 10 PM? 
            // Let's stick to raw numbers + "PM" for < 8, "AM" for >= 8 for now, but it's a guess.
            // Actually, let's just use the numbers as is if ambiguous.
            return n < 8 ? `${n} PM` : `${n} AM`
        }

        if (timeParts.length >= 2) {
            timeSlot = `${formatTime(timeParts[0])} - ${formatTime(timeParts[1])}`
        } else {
            timeSlot = formatTime(timeParts[0])
        }
    }

    const daysStr = sortedDays.join(', ')
    const name = `${isOnline ? 'Online' : 'Offline'} | ${daysStr} | ${timeSlot}`

    return {
        name,
        days: daysStr,
        timeSlot,
        isOnline
    }
}

async function main() {
    // 0. Cleanup
    console.log('Cleaning up database...')
    await prisma.feeRecord.deleteMany({})
    await prisma.attendance.deleteMany({})
    await prisma.student.deleteMany({})
    await prisma.batch.deleteMany({})
    // Don't delete all users, just the ones we created? 
    // For safety in this dev env, let's delete non-admin users or just all except maybe a hardcoded admin if exists.
    // Actually, let's just wipe and recreate Teacher Neha.
    await prisma.user.deleteMany({
        where: {
            email: { not: 'admin@arnavabacus.com' } // Keep original admin if exists
        }
    })

    // 1. Create Teacher Neha
    const hashedPassword = await bcrypt.hash('password123', 10)
    const teacher = await prisma.user.create({
        data: {
            name: 'Neha',
            email: 'neha@arnavabacus.com',
            password: hashedPassword,
            role: 'TEACHER'
        }
    })
    console.log('Created Teacher: Neha')

    // 2. Read CSV
    const csvPath = path.join(process.cwd(), 'Arnav Abacus Academy -26Nov24-07-04-25(Student Master).csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').slice(2) // Skip 2 header lines

    const studentsMap = new Map<string, any[]>()

    // 3. Parse CSV Lines
    for (const line of lines) {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        const cols = line.split(',') // Simple split for now

        if (cols.length < 5) continue
        const studentNo = cols[4]?.trim()
        if (!studentNo || studentNo === 'Student No') continue

        if (!studentsMap.has(studentNo)) {
            studentsMap.set(studentNo, [])
        }
        studentsMap.get(studentNo)?.push({
            studentNo,
            name: cols[5]?.trim(),
            levelCode: cols[6]?.trim(),
            levelName: cols[9]?.trim(),
            progress: cols[8]?.trim(),
            batchStr: cols[15]?.trim(),
            expectedFee: parseFloat(cols[26]?.trim() || '0'),
            receivedFee: parseFloat(cols[27]?.trim() || '0'),
            feeDate: cols[30]?.trim(),
            joiningDate: cols[14]?.trim(),
            parentName: cols[5]?.trim() + " Parent", // Placeholder
            contact: "9999999999" // Placeholder
        })
    }

    // 4. Process Students & Batches
    const batchCache = new Map<string, string>() // Name -> ID

    for (const [studentNo, rows] of studentsMap) {
        // Find active row (WIP) or last row
        let activeRow = rows.find(r => r.progress?.toUpperCase().includes('WIP'))
        if (!activeRow) activeRow = rows[rows.length - 1]

        const { name, batchStr, levelName, joiningDate } = activeRow
        const isActive = !activeRow.progress?.toUpperCase().includes('INACTIVE')

        // Batch Handling
        let batchId = null
        if (batchStr) {
            const batchData = normalizeBatch(batchStr)
            if (batchData) {
                if (!batchCache.has(batchData.name)) {
                    // Check DB first (in case created by another student)
                    let dbBatch = await prisma.batch.findFirst({ where: { name: batchData.name } })
                    if (!dbBatch) {
                        dbBatch = await prisma.batch.create({
                            data: {
                                name: batchData.name,
                                days: batchData.days,
                                timeSlot: batchData.timeSlot,
                                teacherId: teacher.id
                            }
                        })
                        console.log(`Created Batch: ${batchData.name}`)
                    }
                    batchCache.set(batchData.name, dbBatch.id)
                }
                batchId = batchCache.get(batchData.name)
            }
        }

        // Create Parent User
        const parentEmail = `parent.${studentNo.toLowerCase()}@arnavabacus.com`
        let parent = await prisma.user.findUnique({ where: { email: parentEmail } })
        if (!parent) {
            parent = await prisma.user.create({
                data: {
                    name: `${name}'s Parent`,
                    email: parentEmail,
                    password: hashedPassword,
                    role: 'PARENT'
                }
            })
        }

        // Create Student
        const student = await prisma.student.create({
            data: {
                name: name,
                dob: new Date('2015-01-01'), // Placeholder
                gender: 'OTHER',
                level: levelName,
                batchId: batchId,
                joiningDate: parseDate(joiningDate) || new Date(),
                active: isActive,
                parentId: parent.id,
                contactNumber: '9999999999'
            }
        })
        console.log(`Created Student: ${name} (Active: ${isActive})`)

        // Create Fees
        for (const row of rows) {
            if (row.expectedFee > 0) {
                const status = row.receivedFee >= row.expectedFee ? 'PAID' : 'PENDING'
                const dueDate = parseDate(row.feeDate) || parseDate(row.joiningDate) || new Date()

                await prisma.feeRecord.create({
                    data: {
                        studentId: student.id,
                        amount: row.expectedFee,
                        dueDate: dueDate,
                        status: status,
                        cycle: 'LEVEL_WISE',
                        year: dueDate.getFullYear(),
                        month: dueDate.getMonth() + 1,
                        remarks: `Level: ${row.levelName}`
                    }
                })
            }
        }
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
