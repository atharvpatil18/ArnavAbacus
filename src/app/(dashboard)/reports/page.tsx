import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { ReportsCharts } from '@/components/dashboard/reports-charts'

async function getStats() {
    const [
        totalStudents,
        activeStudents,
        totalBatches,
        attendanceRecords,
        feeRecords
    ] = await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { active: true } }),
        prisma.batch.count(),
        prisma.attendance.findMany({
            take: 100,
            orderBy: { date: 'desc' },
            select: { status: true, date: true }
        }),
        prisma.feeRecord.findMany({
            where: { status: 'PAID' },
            take: 100,
            orderBy: { paidDate: 'desc' },
            select: { amount: true, paidDate: true }
        })
    ])

    // Calculate Attendance Rate
    const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length
    const attendanceRate = attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0

    // Calculate Monthly Revenue (Simple approximation from last 100 records)
    const totalRevenue = feeRecords.reduce((acc, curr) => acc + curr.amount, 0)

    return {
        totalStudents,
        activeStudents,
        totalBatches,
        attendanceRate,
        totalRevenue,
        attendanceRecords,
        feeRecords
    }
}

export default async function ReportsPage() {
    const stats = await getStats()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                <p className="text-muted-foreground">
                    Overview of academy performance and key metrics.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeStudents} active students
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Average over last 100 records
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            From recent transactions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBatches}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently running classes
                        </p>
                    </CardContent>
                </Card>
            </div>

            <ReportsCharts
                attendanceData={stats.attendanceRecords}
                revenueData={stats.feeRecords}
            />
        </div>
    )
}
