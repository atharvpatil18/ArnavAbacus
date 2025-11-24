'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardStats {
    totalStudents: number
    activeBatches: number
    pendingFees: number
    attendanceRate: number
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0,
        activeBatches: 0,
        pendingFees: 0,
        attendanceRate: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Only admins see full stats
        if (session?.user?.role === 'ADMIN') {
            fetch('/api/dashboard/stats')
                .then(res => res.json())
                .then(data => {
                    setStats(data)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [session])

    // Redirect parents to their students list
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'PARENT') {
            router.push('/students')
        }
    }, [session, status, router])

    // Teacher sees today's schedule
    if (session?.user?.role === 'TEACHER') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back!</h2>
                    <p className="text-muted-foreground mt-1">
                        Check today's schedule and mark attendance for your batches.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
                    <Card className="border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/today')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Today's Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View all batches scheduled for today</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/attendance')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Mark Attendance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Quick access to attendance marking</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-pink-500" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/batches">View All Batches</Link>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/students">View Students</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Parent dashboard handled by redirect
    if (session?.user?.role === 'PARENT') {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        )
    }

    // Admin dashboard with stats
    const statsCards = [
        {
            title: 'Total Students',
            value: loading ? '...' : stats.totalStudents.toString(),
            change: '+12% from last month',
            trend: 'up',
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100'
        },
        {
            title: 'Active Batches',
            value: loading ? '...' : stats.activeBatches.toString(),
            change: 'Running smoothly',
            trend: 'neutral',
            icon: Calendar,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            border: 'border-pink-100'
        },
        {
            title: 'Pending Fees',
            value: loading ? '...' : `₹${stats.pendingFees.toLocaleString()}`,
            change: 'Due this week',
            trend: 'down',
            icon: CreditCard,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100'
        },
        {
            title: 'Attendance Rate',
            value: loading ? '...' : `${stats.attendanceRate}%`,
            change: '+2% increase',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100'
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's what's happening at your academy today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title} className={cn("border-l-4 shadow-sm hover:shadow-md transition-all duration-200", stat.border)}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn("p-2 rounded-full", stat.bg)}>
                                    <Icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                    {stat.trend === 'up' && <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />}
                                    {stat.trend === 'down' && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
                                    {stat.trend === 'neutral' && <Activity className="mr-1 h-3 w-3 text-blue-500" />}
                                    <span className={cn(
                                        stat.trend === 'up' ? 'text-emerald-600' :
                                            stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    )}>
                                        {stat.change}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-t-4 border-t-indigo-500 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
                            <div className="p-3 bg-gray-50 rounded-full">
                                <Activity className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">No recent activity</p>
                                <p className="text-xs text-muted-foreground max-w-[200px]">
                                    Actions taken in the system will appear here automatically.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-t-4 border-t-pink-500 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-pink-500" />
                            Upcoming Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
                            <div className="p-3 bg-gray-50 rounded-full">
                                <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">No classes today</p>
                                <p className="text-xs text-muted-foreground max-w-[200px]">
                                    Schedule batches to see upcoming classes here.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
