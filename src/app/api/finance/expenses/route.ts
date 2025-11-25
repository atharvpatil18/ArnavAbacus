import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/rbac'
import { logger } from '@/lib/logger'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user || !isAdmin(session)) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Explicitly log for debugging
        logger.info({ userId: session.user.id, role: session.user.role }, 'Fetching expenses')

        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(expenses)
    } catch (error) {
        console.error('[EXPENSES_GET]', error)
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || !isAdmin(session)) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { amount, category, description, date } = body

        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                category,
                description,
                date: new Date(date)
            }
        })

        return NextResponse.json(expense)
    } catch (error) {
        console.error('[EXPENSES_POST]', error)
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
    }
}
