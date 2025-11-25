
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BookOpen, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'

async function getDetailedStats() {
    const [
        totalStudents,
        studentsByLevel,
        totalBatches,
        batchesByLevel,
        totalRevenue,
        revenueByMonth,
        attendanceStats
    ] = await Promise.all([
        prisma.student.count(),
        prisma.student.groupBy({
            by: ['level'],
            _count: { id: true }
        }),
        prisma.batch.count(),
        prisma.batch.groupBy({
            by: ['level'],
            _count: { id: true }
        }),
        prisma.feeRecord.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID' }
        }),
        prisma.feeRecord.groupBy({
            by: ['month', 'year'],
            _sum: { amount: true },
            where: { status: 'PAID' },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 6
        }),
        prisma.attendance.groupBy({
            by: ['status'],
            _count: { id: true }
        })
    ])

    return {
        totalStudents,
        studentsByLevel,
        totalBatches,
        batchesByLevel,
        totalRevenue: totalRevenue._sum.amount || 0,
        revenueByMonth,
        attendanceStats
    }
}

export default async function StatisticsPage() {
    const stats = await getDetailedStats()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Detailed Statistics</h2>
                <p className="text-muted-foreground">
                    Deep dive into your academy's data.
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                                <p className="text-xs text-muted-foreground">Enrolled students</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalBatches}</div>
                                <p className="text-xs text-muted-foreground">Active batches</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                            <CardHeader>
                                <CardTitle>Students by Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {stats.studentsByLevel.map((level) => (
                                        <div key={level.level} className="flex items-center justify-between p-2 rounded-lg border border-border bg-secondary/20">
                                            <span className="font-medium">{level.level || 'Unassigned'}</span>
                                            <span className="font-bold">{level._count.id} Students</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                            <CardHeader>
                                <CardTitle>Batches by Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {stats.batchesByLevel.map((level) => (
                                        <div key={level.level} className="flex items-center justify-between p-2 rounded-lg border border-border bg-secondary/20">
                                            <span className="font-medium">{level.level || 'Unassigned'}</span>
                                            <span className="font-bold">{level._count.id} Batches</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                    <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                        <CardHeader>
                            <CardTitle>Monthly Revenue Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {stats.revenueByMonth.map((record) => (
                                    <div key={`${record.month}-${record.year}`} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {record.month ? format(new Date(record.year, record.month - 1), 'MMMM yyyy') : 'Unknown'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-bead-green">₹{record._sum.amount?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
