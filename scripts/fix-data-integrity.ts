
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting data integrity fix...')

    // 1. Ensure at least one Teacher exists
    let teacher = await prisma.user.findFirst({
        where: { role: 'TEACHER' }
    })

    if (!teacher) {
        console.log('No teacher found. Promoting first admin or creating one.')
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) {
            // Just use the admin as a teacher for now if no teacher exists
            teacher = admin
        } else {
            // Should not happen if seeded, but fallback
            console.error('No users found! Please run seed script first.')
            return
        }
    }
    console.log(`Using teacher: ${teacher.name} (${teacher.id})`)

    // 2. Fix Batches (Assign Teacher if missing)
    const batches = await prisma.batch.findMany()
    let defaultBatchId = batches[0]?.id

    if (batches.length === 0) {
        console.log('Creating default batch...')
        const newBatch = await prisma.batch.create({
            data: {
                name: 'Level 1 - Weekday',
                level: 'Level 1',
                days: 'Monday,Tuesday,Wednesday,Friday',
                timeSlot: '17:00-18:00',
                teacherId: teacher.id
            }
        })
        defaultBatchId = newBatch.id
    } else {
        // Update batches without teachers
        await prisma.batch.updateMany({
            where: { teacherId: null },
            data: { teacherId: teacher.id }
        })
        // Force update days for demo purposes to include Tuesday
        await prisma.batch.updateMany({
            data: { days: 'Monday,Tuesday,Wednesday,Friday' }
        })
        console.log('Updated batches with missing teachers and set days.')
    }

    // 3. Fix Students (Assign Batch & Email)
    const students = await prisma.student.findMany()

    for (const student of students) {
        const updates: any = {}

        // Fix Batch
        if (!student.batchId) {
            updates.batchId = defaultBatchId
        }

        // Fix Email
        if (!student.email || student.email === 'N/A' || student.email === 'No email') {
            const sanitizedName = student.name.toLowerCase().replace(/[^a-z0-9]/g, '')
            updates.email = `${sanitizedName}${student.id.substring(0, 4)}@arnavabacus.com`
        }

        if (Object.keys(updates).length > 0) {
            await prisma.student.update({
                where: { id: student.id },
                data: updates
            })
            console.log(`Updated student ${student.name}: ${JSON.stringify(updates)}`)
        }
    }

    // 4. Generate Attendance for last 30 days
    console.log('Generating attendance data...')
    const allBatches = await prisma.batch.findMany({
        include: { students: true }
    })

    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    for (const batch of allBatches) {
        if (!batch.students.length) continue

        // Parse days (e.g. "Monday,Wednesday")
        const batchDays = batch.days.split(',').map(d => d.trim().toLowerCase())
        const dayMap: { [key: string]: number } = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        }
        const targetDayIndices = batchDays.map(d => dayMap[d]).filter(d => d !== undefined)

        // Iterate dates
        for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dayIndex = d.getDay()
            if (targetDayIndices.includes(dayIndex)) {
                // Check if attendance already exists for this batch/date
                // (Simplified check: just check one student or assume we can upsert)

                for (const student of batch.students) {
                    // Random status
                    const rand = Math.random()
                    let status = 'PRESENT'
                    if (rand > 0.95) status = 'ABSENT'
                    else if (rand > 0.90) status = 'LATE'

                    // Upsert attendance
                    const attendanceDate = new Date(d)
                    attendanceDate.setHours(0, 0, 0, 0)

                    try {
                        await prisma.attendance.upsert({
                            where: {
                                date_studentId_batchId: {
                                    date: attendanceDate,
                                    studentId: student.id,
                                    batchId: batch.id
                                }
                            },
                            update: {}, // Don't overwrite existing
                            create: {
                                date: attendanceDate,
                                studentId: student.id,
                                batchId: batch.id,
                                status: status
                            }
                        })
                    } catch (e) {
                        // Ignore duplicates if any weirdness
                    }
                }
            }
        }
    }
    console.log('Attendance generation complete.')

    // 5. Fix Demo Classes (Assign Teacher)
    await prisma.demoClass.updateMany({
        where: { teacherId: null },
        data: { teacherId: teacher.id }
    })
    console.log('Updated demo classes with missing teachers.')

    console.log('Data integrity fix completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
