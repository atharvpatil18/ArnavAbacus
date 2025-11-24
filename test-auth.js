// Test script to verify database and bcrypt
const { PrismaClient } = require('@prisma/client')
const { compare } = require('bcryptjs')

const prisma = new PrismaClient()

async function test() {
    console.log('🔍 Testing authentication setup...\n')

    // Check if admin user exists
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@arnavabacus.com' }
    })

    if (!admin) {
        console.log('❌ Admin user NOT found in database!')
        console.log('📝 Please run: npx prisma db seed')
        return
    }

    console.log('✅ Admin user found:')
    console.log('   Email:', admin.email)
    console.log('   Name:', admin.name)
    console.log('   Role:', admin.role)
    console.log('   Has password:', !!admin.password)
    console.log('   Password hash (first 20 chars):', admin.password?.substring(0, 20))

    // Test password comparison
    if (admin.password) {
        const testPassword = 'password123'
        const matches = await compare(testPassword, admin.password)
        console.log('\n🔐 Password test:')
        console.log('   Test password:', testPassword)
        console.log('   Matches:', matches ? '✅ YES' : '❌ NO')

        if (!matches) {
            console.log('\n⚠️  Password does not match! Database may need reseeding.')
        }
    }

    await prisma.$disconnect()
}

test().catch(console.error)
