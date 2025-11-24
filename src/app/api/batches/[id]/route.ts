import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserRole, requireRole } from '@/lib/rbac'
import { updateBatchSchema, validateRequest } from '@/lib/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const batch = await prisma.batch.findUnique({
            where: { id },
            include: {
                students: {
                    select: {
                        id: true,
                        name: true,
                        active: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        })

        if (!batch) {
            return NextResponse.json(
                { error: 'Batch not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(batch)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch batch' },
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

        // RBAC: Only admins can update batches
        requireRole(session, [UserRole.ADMIN])

        const { id } = await params
        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(updateBatchSchema, body)

        const batch = await prisma.batch.update({
            where: { id },
            data: {
                name: validatedData.name,
                level: validatedData.level,
                days: Array.isArray(validatedData.days) ? validatedData.days.join(',') : validatedData.days,
                timeSlot: validatedData.timeSlot
            }
        })

        return NextResponse.json(batch)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        if (errorMessage.includes('Validation error')) {
            return NextResponse.json({ error: errorMessage }, { status: 400 })
        }

        console.error('Error updating batch:', error)
        return NextResponse.json(
            { error: 'Failed to update batch' },
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

        // RBAC: Only admins can delete batches
        requireRole(session, [UserRole.ADMIN])

        const { id } = await params

        // Transaction to unassign students and delete batch
        await prisma.$transaction([
            prisma.student.updateMany({
                where: { batchId: id },
                data: { batchId: null }
            }),
            prisma.batch.delete({
                where: { id }
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        console.error('Error deleting batch:', error)
        return NextResponse.json(
            { error: 'Failed to delete batch' },
            { status: 500 }
        )
    }
}
