import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@arnavabacus.com' },
        update: {},
        create: {
            email: 'admin@arnavabacus.com',
            name: 'Admin User',
            role: 'ADMIN',
            password: await hash('password123', 10),
        },
    })
    console.log({ admin })

    // 2. Create Teacher
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@arnavabacus.com' },
        update: {},
        create: {
            email: 'teacher@arnavabacus.com',
            name: 'Jane Teacher',
            role: 'TEACHER',
            password: await hash('password123', 10),
        },
    })
    console.log({ teacher })

    // 3. Create Parent
    const parent = await prisma.user.upsert({
        where: { email: 'parent@arnavabacus.com' },
        update: {},
        create: {
            email: 'parent@arnavabacus.com',
            name: 'John Parent',
            role: 'PARENT',
            password: await hash('password123', 10),
        },
    })
    console.log({ parent })

    // 4. Create Batch
    const batch = await prisma.batch.create({
        data: {
            name: 'Level 1 - Mon/Wed',
            level: 'Level 1',
            days: 'MON,WED', // Stored as comma-separated string for SQLite
            timeSlot: '17:00-18:00',
            teacherId: teacher.id,
        },
    })
    console.log({ batch })

    // 5. Create Student
    const student = await prisma.student.create({
        data: {
            name: 'Alice Student',
            dob: new Date('2015-05-15'),
            gender: 'FEMALE',
            contactNumber: '1234567890',
            address: '123 Main St',
            level: 'Level 1',
            parentId: parent.id,
            batchId: batch.id,
        },
    })
    console.log({ student })

    // 6. Create Fee Record
    const fee = await prisma.feeRecord.create({
        data: {
            studentId: student.id,
            amount: 1500,
            dueDate: new Date(),
            status: 'PENDING',
            cycle: 'MONTHLY',
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            remarks: 'November Fee',
        },
    })
    console.log({ fee })

    // 7. Create Attendance Record
    const attendance = await prisma.attendance.create({
        data: {
            date: new Date(),
            status: 'PRESENT',
            studentId: student.id,
            batchId: batch.id,
        },
    })
    console.log({ attendance })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
