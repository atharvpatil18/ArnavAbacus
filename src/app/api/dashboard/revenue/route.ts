import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin, isTeacher } from '@/lib/rbac'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Only Admin and Teacher can see revenue
        if (!isAdmin(session) && !isTeacher(session)) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const userId = session.user.id

        // Get revenue data for last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        let fees
        if (isAdmin(session)) {
            fees = await prisma.feeRecord.findMany({
                where: {
                    status: 'PAID',
                    paidDate: {
                        gte: sixMonthsAgo
                    }
                },
                select: {
                    amount: true,
                    paidDate: true
                }
            })
        } else {
            // Teacher sees only their batches
            fees = await prisma.feeRecord.findMany({
                where: {
                    status: 'PAID',
                    paidDate: {
                        gte: sixMonthsAgo
                    },
                    student: {
                        batch: {
                            teacherId: userId
                        }
                    }
                },
                select: {
                    amount: true,
                    paidDate: true
                }
            })
        }

        // Group by month
        const revenueByMonth = new Map<string, number>()
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        fees.forEach(fee => {
            if (fee.paidDate) {
                const date = new Date(fee.paidDate)
                const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`
                const current = revenueByMonth.get(monthKey) || 0
                revenueByMonth.set(monthKey, current + fee.amount)
            }
        })

        // Convert to array format for chart
        const data = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({
            month,
            revenue: Math.round(revenue)
        }))

        // Sort by date
        data.sort((a, b) => {
            const [aMonth, aYear] = a.month.split(' ')
            const [bMonth, bYear] = b.month.split(' ')
            const aDate = new Date(parseInt('20' + aYear), monthNames.indexOf(aMonth))
            const bDate = new Date(parseInt('20' + bYear), monthNames.indexOf(bMonth))
            return aDate.getTime() - bDate.getTime()
        })

        return NextResponse.json(data)
    } catch (error) {
        console.error('[REVENUE_GET]', error)
        return NextResponse.json(
            { error: 'Failed to fetch revenue data' },
            { status: 500 }
        )
    }
}
