import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function resetUsers() {
    console.log('🗑️  Deleting existing users...')

    // Delete all users
    await prisma.user.deleteMany({})

    console.log('✅ Users deleted\n')
    console.log('👤 Creating users with hashed passwords...\n')

    // Create admin with hashed password
    const admin = await prisma.user.create({
        data: {
            email: 'admin@arnavabacus.com',
            name: 'Admin User',
            role: 'ADMIN',
            password: await hash('password123', 10),
        },
    })
    console.log('✅ Created admin:', admin.email)

    // Create teacher
    const teacher = await prisma.user.create({
        data: {
            email: 'teacher@arnavabacus.com',
            name: 'Jane Teacher',
            role: 'TEACHER',
            password: await hash('password123', 10),
        },
    })
    console.log('✅ Created teacher:', teacher.email)

    // Create parent
    const parent = await prisma.user.create({
        data: {
            email: 'parent@arnavabacus.com',
            name: 'John Parent',
            role: 'PARENT',
            password: await hash('password123', 10),
        },
    })
    console.log('✅ Created parent:', parent.email)

    console.log('\n✨ Done! All users now have hashed passwords.')

    await prisma.$disconnect()
}

resetUsers().catch(console.error)
