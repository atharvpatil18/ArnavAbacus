import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Failed to fetch user:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const body = await request.json()
        const { name, email, password, role } = body

        const updateData: any = {
            name,
            email,
            role,
        }

        if (password) {
            updateData.password = await hash(password, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        })

        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword)
    } catch (error) {
        console.error('Failed to update user:', error)
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        await prisma.user.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Failed to delete user:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
