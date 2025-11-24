import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { UserRole, requireRole, isAdmin, isTeacher, isParent } from '@/lib/rbac'
import { createBatchSchema, validateRequest } from '@/lib/validation'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const level = searchParams.get('level')
        const teacherId = searchParams.get('teacherId')

        const where: any = {}

        if (level) {
            where.level = level
        }

        if (teacherId) {
            where.teacherId = teacherId
        }

        // RBAC: Filter based on role
        if (isTeacher(session)) {
            // Teachers can only view their own batches
            where.teacherId = session.user.id
        } else if (isParent(session)) {
            // Parents can only view batches where their children are enrolled
            where.students = {
                some: {
                    parentId: session.user.id
                }
            }
        }
        // Admin can view all batches (no additional filter)

        const batches = await prisma.batch.findMany({
            where,
            include: {
                teacher: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(batches)
    } catch (error) {
        console.error('[BATCHES_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Only admins can create batches
        requireRole(session, [UserRole.ADMIN])

        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(createBatchSchema, body)
        const { name, level, days, timeSlot, teacherId } = validatedData

        // Validate days format
        let daysString: string = Array.isArray(days) ? days.join(',') : days

        const batch = await prisma.batch.create({
            data: {
                name,
                level,
                days: daysString,
                timeSlot,
                teacherId,
            },
        })

        return NextResponse.json(batch)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        if (errorMessage.includes('Validation error')) {
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            )
        }

        console.error('[BATCHES_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
