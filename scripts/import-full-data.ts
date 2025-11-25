import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '' || dateStr.trim() === 'NA') return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
}

function parseFloatSafe(str: string): number {
    if (!str) return 0
    const cleaned = str.replace(/[^0-9.-]/g, '')
    const val = parseFloat(cleaned)
    return isNaN(val) ? 0 : val
}

async function main() {
    console.log('Starting full data import...')

    // 1. Read CSV
    const csvPath = path.join(process.cwd(), 'Arnav Abacus Academy -26Nov24-07-04-25(Student Master).csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').slice(2) // Skip header rows

    let examCount = 0
    let feeCount = 0
    let skippedCount = 0

    for (const line of lines) {
        const cols = line.split(',') // Simple split, assuming no commas in fields for now
        if (cols.length < 5) continue

        const studentName = cols[5]?.trim()
        if (!studentName) continue

        // Find Student
        const student = await prisma.student.findFirst({
            where: { name: studentName }
        })

        if (!student) {
            console.log(`Student not found: ${studentName}`)
            skippedCount++
            continue
        }

        // --- Import Exam Data ---
        const examDateStr = cols[20]?.trim()
        const scoreStr = cols[21]?.trim()
        const trophyStr = cols[22]?.trim() // "yes", "no", "NA"
        const levelName = cols[9]?.trim() || 'Unknown Level'

        if (examDateStr && scoreStr) {
            const examDate = parseDate(examDateStr)
            const marks = parseFloatSafe(scoreStr)

            if (examDate && marks > 0) {
                // Check if exam already exists to avoid duplicates
                const existingExam = await prisma.exam.findFirst({
                    where: {
                        studentId: student.id,
                        date: examDate,
                        level: levelName
                    }
                })

                if (!existingExam) {
                    await prisma.exam.create({
                        data: {
                            studentId: student.id,
                            level: levelName,
                            marks: marks,
                            totalMarks: 100, // Assuming 100
                            date: examDate,
                            trophyNomination: trophyStr?.toLowerCase() === 'yes',
                            status: 'COMPLETED'
                        }
                    })
                    examCount++
                    console.log(`Added Exam for ${studentName}: ${levelName} - ${marks}%`)
                }
            }
        }

        // --- Import Kit Fees ---
        const kitFeeExpected = parseFloatSafe(cols[10])
        const kitFeeReceived = parseFloatSafe(cols[11])
        const kitFeeDateStr = cols[12]?.trim() // Received On

        if (kitFeeExpected > 0) {
            // Check if this fee record already exists
            const existingFee = await prisma.feeRecord.findFirst({
                where: {
                    studentId: student.id,
                    amount: kitFeeExpected,
                    remarks: 'Kit and Books'
                }
            })

            if (!existingFee) {
                const dueDate = parseDate(cols[14]) || new Date() // Level Joined On or Now
                const paidDate = parseDate(kitFeeDateStr)
                const status = kitFeeReceived >= kitFeeExpected ? 'PAID' : 'PENDING'

                await prisma.feeRecord.create({
                    data: {
                        studentId: student.id,
                        amount: kitFeeExpected,
                        dueDate: dueDate,
                        paidDate: paidDate,
                        status: status,
                        cycle: 'ONE_TIME', // Kit fees are one-time
                        year: dueDate.getFullYear(),
                        month: dueDate.getMonth() + 1,
                        remarks: 'Kit and Books'
                    }
                })
                feeCount++
                console.log(`Added Kit Fee for ${studentName}: ${kitFeeExpected}`)
            }
        }
    }

    console.log('--- Import Summary ---')
    console.log(`Exams Added: ${examCount}`)
    console.log(`Kit Fees Added: ${feeCount}`)
    console.log(`Students Skipped (Not Found): ${skippedCount}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
