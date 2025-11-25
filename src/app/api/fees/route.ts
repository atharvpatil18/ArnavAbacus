import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { UserRole, requireRole } from '@/lib/rbac'
import { createFeeSchema, validateRequest } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { ratelimit } from '@/lib/ratelimit'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get('studentId')
        const status = searchParams.get('status')

        const where: any = {}

        if (studentId) {
            where.studentId = studentId
        }

        if (status) {
            where.status = status
        }

        // RBAC: Parents can only see their own children
        if (session.user.role === 'PARENT') {
            where.student = { parentId: session.user.id }
        }

        const fees = await prisma.feeRecord.findMany({
            where,
            include: {
                student: {
                    select: {
                        name: true,
                        level: true,
                    }
                }
            },
            orderBy: {
                dueDate: 'desc',
            },
        })

        return NextResponse.json(fees)
    } catch (error) {
        logger.error({ error, context: 'FEES_GET' }, 'Failed to fetch fees')
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Rate limiting for write operations
        const identifier = session.user.id || 'anonymous'
        const { success } = await ratelimit.limit(identifier)
        if (!success) {
            logger.warn({ userId: identifier }, 'Rate limit exceeded for fee creation')
            return new NextResponse('Too Many Requests', { status: 429 })
        }

        // RBAC: Only admins can create fee records
        requireRole(session, [UserRole.ADMIN])

        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(createFeeSchema, body)
        const { studentId, amount, dueDate, cycle, year, month, remarks, type, date, status } = validatedData

        // Map frontend fields to schema
        const feeCycle = cycle || type || 'MONTHLY'
        const feeDate = date ? new Date(date) : new Date()
        const feeDueDate = dueDate ? new Date(dueDate) : feeDate
        const feeYear = year ? parseInt(String(year)) : feeDate.getFullYear()
        const feeMonth = month ? parseInt(String(month)) : (feeDate.getMonth() + 1)
        const feeStatus = status || 'PENDING'
        const feePaidDate = feeStatus === 'PAID' ? feeDate : null

        const fee = await prisma.feeRecord.create({
            data: {
                studentId,
                amount: parseFloat(String(amount)),
                dueDate: feeDueDate,
                paidDate: feePaidDate,
                cycle: feeCycle,
                year: feeYear,
                month: feeMonth,
                remarks,
                status: feeStatus,
            },
        })

        return NextResponse.json(fee)
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

        logger.error({ error, context: 'FEES_POST' }, 'Failed to create fee')
        return new NextResponse('Internal Error', { status: 500 })
    }
}
