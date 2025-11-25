'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

interface ReportsChartsProps {
    attendanceData: { status: string; date: Date }[]
    revenueData: { amount: number; paidDate: Date | null }[]
}

export function ReportsCharts({ attendanceData, revenueData }: ReportsChartsProps) {
    // Process Attendance Data
    const attendanceByDate = attendanceData.reduce((acc, curr) => {
        const date = format(new Date(curr.date), 'MMM dd')
        if (!acc[date]) {
            acc[date] = { date, present: 0, absent: 0 }
        }
        if (curr.status === 'PRESENT') acc[date].present++
        else acc[date].absent++
        return acc
    }, {} as Record<string, { date: string; present: number; absent: number }>)

    const chartData = Object.values(attendanceByDate).reverse().slice(0, 7)

    // Process Revenue Data
    const revenueByMonth = revenueData.reduce((acc, curr) => {
        if (!curr.paidDate) return acc
        const month = format(new Date(curr.paidDate), 'MMM yyyy')
        if (!acc[month]) {
            acc[month] = { month, amount: 0 }
        }
        acc[month].amount += curr.amount
        return acc
    }, {} as Record<string, { month: string; amount: number }>)

    const revenueChartData = Object.values(revenueByMonth).reverse().slice(0, 6)

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                <CardHeader>
                    <CardTitle>Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--accent)', opacity: 0.2 }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '2px solid var(--border)',
                                            boxShadow: '4px 4px 0px 0px var(--border)',
                                            backgroundColor: 'var(--background)'
                                        }}
                                    />
                                    <Bar dataKey="present" fill="var(--bead-green)" radius={[4, 4, 0, 0]} name="Present" />
                                    <Bar dataKey="absent" fill="var(--bead-red)" radius={[4, 4, 0, 0]} name="Absent" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No attendance data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1 border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]">
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        {revenueChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--accent)', opacity: 0.2 }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '2px solid var(--border)',
                                            boxShadow: '4px 4px 0px 0px var(--border)',
                                            backgroundColor: 'var(--background)'
                                        }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar dataKey="amount" fill="var(--bead-yellow)" radius={[4, 4, 0, 0]} name="Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
