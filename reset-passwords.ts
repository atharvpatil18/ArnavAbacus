import { prisma } from './src/lib/prisma'
import { hash } from 'bcryptjs'

async function resetPasswords() {
    console.log('Resetting user passwords...')

    // Hash for 'admin123'
    const adminHash = await hash('admin123', 10)
    // Hash for 'teacher123'
    const teacherHash = await hash('teacher123', 10)
    // Hash for 'parent123'
    const parentHash = await hash('parent123', 10)

    // Update admin
    await prisma.user.update({
        where: { email: 'admin@arnavabacus.com' },
        data: { password: adminHash }
    })
    console.log('✓ Admin password set to: admin123')

    // Update teacher
    await prisma.user.update({
        where: { email: 'teacher@arnavabacus.com' },
        data: { password: teacherHash }
    })
    console.log('✓ Teacher password set to: teacher123')

    // Update parent
    await prisma.user.update({
        where: { email: 'parent@arnavabacus.com' },
        data: { password: parentHash }
    })
    console.log('✓ Parent password set to: parent123')

    console.log('\n=== Test Credentials ===')
    console.log('ADMIN:   admin@arnavabacus.com / admin123')
    console.log('TEACHER: teacher@arnavabacus.com / teacher123')
    console.log('PARENT:  parent@arnavabacus.com / parent123')
    console.log('========================\n')
}

resetPasswords()
    .then(() => {
        console.log('Password reset complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Error resetting passwords:', error)
        process.exit(1)
    })
