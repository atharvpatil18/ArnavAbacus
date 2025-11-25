import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/rbac'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user || !isAdmin(session)) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const [revenueData, expenseData] = await Promise.all([
            prisma.feeRecord.aggregate({
                where: { status: 'PAID' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                _sum: { amount: true }
            })
        ])

        const revenue = revenueData._sum.amount || 0
        const expenses = expenseData._sum.amount || 0
        const profit = revenue - expenses

        return NextResponse.json({
            revenue,
            expenses,
            profit
        })
    } catch (error) {
        console.error('[FINANCE_STATS_GET]', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
