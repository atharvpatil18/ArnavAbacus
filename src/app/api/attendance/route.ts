import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { UserRole, requireRole, isTeacher } from '@/lib/rbac'
import { markAttendanceSchema, validateRequest } from '@/lib/validation'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const batchId = searchParams.get('batchId')
        const date = searchParams.get('date')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const whereClause: any = {
                date: {
                    gte: start,
                    lte: end,
                }
            }

            if (batchId) {
                whereClause.batchId = batchId
            }

            // RBAC: Parents can only see their own children
            if (session.user.role === 'PARENT') {
                whereClause.student = { parentId: session.user.id }
            }

            const attendance = await prisma.attendance.findMany({
                where: whereClause,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    batch: {
                        select: {
                            id: true,
                            name: true,
                            timeSlot: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            })

            return NextResponse.json(attendance)
        }

        if (!batchId || !date) {
            return new NextResponse('Missing batchId or date, or startDate/endDate', { status: 400 })
        }

        const targetDate = new Date(date)
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const whereSingle: any = {
            batchId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        }

        // RBAC: Parents can only see their own children
        if (session.user.role === 'PARENT') {
            whereSingle.student = { parentId: session.user.id }
        }

        const attendance = await prisma.attendance.findMany({
            where: whereSingle,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return NextResponse.json(attendance)
    } catch (error) {
        console.error('[ATTENDANCE_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Only admins and teachers can mark attendance
        requireRole(session, [UserRole.ADMIN, UserRole.TEACHER])

        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(markAttendanceSchema, body)
        const { batchId, date, records } = validatedData

        // If user is a teacher, verify they own this batch
        if (isTeacher(session)) {
            const batch = await prisma.batch.findUnique({
                where: { id: batchId },
                select: { teacherId: true }
            })

            if (!batch || batch.teacherId !== session.user.id) {
                return new NextResponse('Forbidden: You can only mark attendance for your own batches', { status: 403 })
            }
        }

        const targetDate = new Date(date)

        // Using transaction to update multiple records
        const results = await prisma.$transaction(
            records.map((record: { studentId: string; status: string }) => {
                return prisma.attendance.upsert({
                    where: {
                        date_studentId_batchId: {
                            batchId,
                            studentId: record.studentId,
                            date: targetDate,
                        },
                    },
                    update: {
                        status: record.status,
                    },
                    create: {
                        batchId,
                        studentId: record.studentId,
                        date: targetDate,
                        status: record.status,
                    },
                })
            })
        )

        return NextResponse.json(results)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden' || errorMessage.includes('Forbidden:')) {
            return new NextResponse(errorMessage, { status: 403 })
        }

        if (errorMessage.includes('Validation error')) {
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            )
        }

        console.error('[ATTENDANCE_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
