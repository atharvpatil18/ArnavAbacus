import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const studentCount = await prisma.student.count()
    const batchCount = await prisma.batch.count()
    const feeCount = await prisma.feeRecord.count()
    const userCount = await prisma.user.count()
    const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } })
    const parents = await prisma.user.count({ where: { role: 'PARENT' } })

    console.log(`Total Students: ${studentCount}`)
    console.log(`Total Batches: ${batchCount}`)
    console.log(`Total Fee Records: ${feeCount}`)
    console.log(`Total Users: ${userCount}`)
    console.log(`Teacher: ${teacher?.name} (${teacher?.email})`)
    console.log(`Total Parents: ${parents}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
