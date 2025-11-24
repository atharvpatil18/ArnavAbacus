import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current and new passwords are required' },
                { status: 400 }
            )
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Verify current password
        const isValidPassword = await compare(currentPassword, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[CHANGE_PASSWORD]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
