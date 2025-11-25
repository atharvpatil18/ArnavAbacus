import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding sample data...')

  // 1. Get some existing students
  const students = await prisma.student.findMany({ take: 5 })
  if (students.length === 0) {
    console.log('No students found. Skipping student-related seeding.')
  } else {
    // 2. Seed Exams
    console.log('Seeding Exams...')
    for (const student of students) {
      await prisma.exam.create({
        data: {
          studentId: student.id,
          level: student.level || 'Level 1',
          marks: Math.floor(Math.random() * 20) + 80, // 80-100
          totalMarks: 100,
          date: new Date(),
          status: 'COMPLETED',
          trophyNomination: Math.random() > 0.7,
        }
      })
    }

    // 3. Seed Homework
    console.log('Seeding Homework...')
    for (const student of students) {
      await prisma.homework.create({
        data: {
          studentId: student.id,
          date: new Date(),
          accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
          status: 'COMPLETED',
          remarks: 'Good job!',
        }
      })
    }
  }

  // 4. Seed Demos
  console.log('Seeding Demo Classes...')
  const demo = await prisma.demoClass.create({
    data: {
      date: new Date(),
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'SCHEDULED',
      students: {
        create: [
          { name: 'Rohan Gupta', parentName: 'Amit Gupta', contact: '9876543210' },
          { name: 'Sia Verma', parentName: 'Rahul Verma', contact: '9876543211' }
        ]
      }
    }
  })

  // 5. Seed Finance
  console.log('Seeding Expenses...')
  await prisma.expense.createMany({
    data: [
      { amount: 15000, category: 'RENT', description: 'Center Rent', date: new Date() },
      { amount: 500, category: 'UTILITIES', description: 'Electricity Bill', date: new Date() },
      { amount: 2000, category: 'MISC', description: 'Office Supplies', date: new Date() }
    ]
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
