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

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Recent Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Revenue chart coming soon...
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
