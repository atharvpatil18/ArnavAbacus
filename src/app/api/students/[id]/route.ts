import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserRole, requireRole } from '@/lib/rbac'
import { updateStudentSchema, validateRequest } from '@/lib/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = await params
        const student = await prisma.student.findUnique({
            where: { id }
        })

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            )
        }

        // RBAC: Parents can only see their own children
        if (session.user.role === 'PARENT' && student.parentId !== session.user.id) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        return NextResponse.json(student)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch student' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Only admins can update students
        requireRole(session, [UserRole.ADMIN])

        const { id } = await params

        // RBAC Check before update
        const existingStudent = await prisma.student.findUnique({ where: { id } })
        if (!existingStudent) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(updateStudentSchema, body)

        const student = await prisma.student.update({
            where: { id },
            data: {
                name: validatedData.name,
                email: validatedData.email,
                contactNumber: validatedData.contactNumber,
                dob: validatedData.dob ? new Date(validatedData.dob) : undefined,
                address: validatedData.address,
                active: validatedData.active,
                level: validatedData.level,
                batchId: validatedData.batchId
            }
        })

        return NextResponse.json(student)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        if (errorMessage.includes('Validation error')) {
            return NextResponse.json({ error: errorMessage }, { status: 400 })
        }

        console.error('Error updating student:', error)
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Parents cannot delete students
        if (session.user.role === 'PARENT') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const { id } = await params
        await prisma.student.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting student:', error)
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        )
    }
}
