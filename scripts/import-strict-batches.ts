import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Strict Batch List
const ALLOWED_BATCHES = [
    { name: 'M W 4-5', days: 'Mon, Wed', timeSlot: '4 PM - 5 PM', isOnline: false },
    { name: 'M W 6-7', days: 'Mon, Wed', timeSlot: '6 PM - 7 PM', isOnline: false },
    { name: 'M W 7-8', days: 'Mon, Wed', timeSlot: '7 PM - 8 PM', isOnline: false },
    { name: 'T T 6-7', days: 'Tue, Thu', timeSlot: '6 PM - 7 PM', isOnline: false },
    { name: 'T T 7-8', days: 'Tue, Thu', timeSlot: '7 PM - 8 PM', isOnline: false },
    { name: 'OTT 4-5', days: 'Tue, Thu', timeSlot: '4 PM - 5 PM', isOnline: true },
    { name: 'O F 5-7', days: 'Fri', timeSlot: '5 PM - 7 PM', isOnline: true },
    { name: 'S S 4-5', days: 'Sat, Sun', timeSlot: '4 PM - 5 PM', isOnline: false },
    { name: 'S S 5-6', days: 'Sat, Sun', timeSlot: '5 PM - 6 PM', isOnline: false },
    { name: 'SAT 4-6', days: 'Sat', timeSlot: '4 PM - 6 PM', isOnline: false },
    { name: 'SS 11-2', days: 'Sat, Sun', timeSlot: '11 AM - 2 PM', isOnline: false }
]

function parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
}

// Helper to find best matching batch
function findMatchingBatch(csvBatchStr: string): string | null {
    if (!csvBatchStr) return null
    const normalized = csvBatchStr.toUpperCase().replace(/\s+/g, '')
    
    // Manual Mapping Logic based on CSV patterns
    // CSV examples: "M-W-4-5", "T-T-6-7", "O-T-T-4-5", "SAT-4-6"
    
    if (normalized.includes('M-W') || normalized.includes('MW')) {
        if (normalized.includes('4-5')) return 'M W 4-5'
        if (normalized.includes('6-7')) return 'M W 6-7'
        if (normalized.includes('7-8')) return 'M W 7-8'
    }
    
    if (normalized.includes('T-T') || normalized.includes('TT')) {
        if (normalized.includes('ONLINE') || normalized.startsWith('O')) {
             if (normalized.includes('4-5')) return 'OTT 4-5'
        }
        if (normalized.includes('6-7')) return 'T T 6-7'
        if (normalized.includes('7-8')) return 'T T 7-8'
    }

    if (normalized.includes('SAT') && !normalized.includes('SUN')) {
        if (normalized.includes('4-6')) return 'SAT 4-6'
    }

    if (normalized.includes('S-S') || normalized.includes('SS') || (normalized.includes('SAT') && normalized.includes('SUN'))) {
        if (normalized.includes('4-5')) return 'S S 4-5'
        if (normalized.includes('5-6')) return 'S S 5-6'
        if (normalized.includes('11-2')) return 'SS 11-2'
    }

    if (normalized.includes('O-F') || (normalized.includes('ONLINE') && normalized.includes('F'))) {
        if (normalized.includes('5-7')) return 'O F 5-7'
    }

    // Fallback fuzzy matching?
    // If "Daily", maybe map to M W? No, user said "These are the only batches".
    // So if no match, return null.
    
    return null
}

async function main() {
    console.log('Cleaning up database...')
    await prisma.feeRecord.deleteMany({})
    await prisma.attendance.deleteMany({})
    await prisma.exam.deleteMany({})
    await prisma.homework.deleteMany({})
    await prisma.demoStudent.deleteMany({})
    await prisma.demoClass.deleteMany({})
    await prisma.student.deleteMany({})
    await prisma.batch.deleteMany({})
    await prisma.user.deleteMany({
        where: { email: { not: 'admin@arnavabacus.com' } }
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

    // 2. Create Allowed Batches
    const batchMap = new Map<string, string>() // Name -> ID
    for (const b of ALLOWED_BATCHES) {
        const batch = await prisma.batch.create({
            data: {
                name: b.name,
                days: b.days,
                timeSlot: b.timeSlot,
                teacherId: teacher.id
            }
        })
        batchMap.set(b.name, batch.id)
        console.log(`Created Batch: ${b.name}`)
    }

    // 3. Read CSV
    const csvPath = path.join(process.cwd(), 'Arnav Abacus Academy -26Nov24-07-04-25(Student Master).csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').slice(2)

    const studentsMap = new Map<string, any[]>()

    for (const line of lines) {
        const cols = line.split(',') // Simple split
        if (cols.length < 5) continue
        const studentNo = cols[4]?.trim()
        if (!studentNo || studentNo === 'Student No') continue

        if (!studentsMap.has(studentNo)) {
            studentsMap.set(studentNo, [])
        }
        studentsMap.get(studentNo)?.push({
            studentNo,
            name: cols[5]?.trim(),
            levelName: cols[9]?.trim(),
            progress: cols[8]?.trim(),
            batchStr: cols[15]?.trim(),
            expectedFee: parseFloat(cols[26]?.trim() || '0'),
            receivedFee: parseFloat(cols[27]?.trim() || '0'),
            feeDate: cols[30]?.trim(),
            joiningDate: cols[14]?.trim()
        })
    }

    // 4. Process Students
    for (const [studentNo, rows] of studentsMap) {
        let activeRow = rows.find(r => r.progress?.toUpperCase().includes('WIP'))
        if (!activeRow) activeRow = rows[rows.length - 1]

        const { name, batchStr, levelName, joiningDate } = activeRow
        const isActive = !activeRow.progress?.toUpperCase().includes('INACTIVE')

        // Match Batch
        let batchId = null
        if (batchStr) {
            const targetBatchName = findMatchingBatch(batchStr)
            if (targetBatchName && batchMap.has(targetBatchName)) {
                batchId = batchMap.get(targetBatchName)
            } else {
                console.log(`Warning: No matching batch for ${name} (${batchStr})`)
            }
        }

        // Create Parent
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
                dob: new Date('2015-01-01'),
                gender: 'OTHER',
                level: levelName,
                batchId: batchId,
                joiningDate: parseDate(joiningDate) || new Date(),
                active: isActive,
                parentId: parent.id,
                contactNumber: '9999999999'
            }
        })

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
