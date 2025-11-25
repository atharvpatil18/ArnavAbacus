'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'

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

    // Parent dashboard
    if (session?.user?.role === 'PARENT') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">My Children</h2>
                    <p className="text-muted-foreground mt-1">
                        Track your child's progress, attendance, and fees.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-t-4 border-t-violet-500 hover:shadow-lg transition-shadow cursor-pointer border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]" onClick={() => router.push('/students')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-violet-500" />
                                Student Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View academic details and progress</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow cursor-pointer border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]" onClick={() => router.push('/attendance')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Attendance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Check attendance records</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow cursor-pointer border-2 border-border shadow-[4px_4px_0px_0px_var(--border)]" onClick={() => router.push('/fees')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-amber-500" />
                                Fees & Payments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View fee status and history</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Admin dashboard with stats
    const statsCards = [
        {
            title: 'Total Students',
            value: stats.totalStudents.toString(),
            change: '+12% from last month',
            trend: 'up',
            icon: Users,
            color: 'text-white',
            bg: 'bg-bead-blue',
            borderColor: 'border-bead-blue'
        },
        {
            title: 'Active Batches',
            value: stats.activeBatches.toString(),
            change: 'Running smoothly',
            trend: 'neutral',
            icon: Calendar,
            color: 'text-white',
            bg: 'bg-bead-purple',
            borderColor: 'border-bead-purple'
        },
        {
            title: 'Pending Fees',
            value: `₹${stats.pendingFees.toLocaleString()}`,
            change: 'Due this week',
            trend: 'down',
            icon: CreditCard,
            color: 'text-white',
            bg: 'bg-bead-yellow',
            borderColor: 'border-bead-yellow'
        },
        {
            title: 'Attendance Rate',
            value: `${stats.attendanceRate}%`,
            change: stats.attendanceRate > 0 ? 'Current Month' : 'No data',
            trend: stats.attendanceRate > 0 ? 'neutral' : 'neutral',
            icon: TrendingUp,
            color: 'text-white',
            bg: 'bg-bead-green',
            borderColor: 'border-bead-green'
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">Dashboard Overview</h2>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's what's happening at your academy today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    statsCards.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Card key={stat.title} className={cn("hover:-translate-y-1 transition-transform duration-200 border-2 shadow-[4px_4px_0px_0px_var(--border)]", stat.borderColor)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-bold text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={cn("p-2 rounded-lg border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]", stat.bg)}>
                                        <Icon className={cn("h-4 w-4", stat.color)} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground font-sans">{stat.value}</div>
                                    <div className="flex items-center mt-1 text-xs font-medium">
                                        {stat.trend === 'up' && <ArrowUpRight className="mr-1 h-3 w-3 text-bead-green" />}
                                        {stat.trend === 'down' && <ArrowDownRight className="mr-1 h-3 w-3 text-bead-red" />}
                                        {stat.trend === 'neutral' && <Activity className="mr-1 h-3 w-3 text-bead-blue" />}
                                        <span className={cn(
                                            stat.trend === 'up' ? 'text-bead-green' :
                                                stat.trend === 'down' ? 'text-bead-red' : 'text-muted-foreground'
                                        )}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Removed DashboardCharts placeholder as per Phase 6.2 */}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] border-t-4 border-t-bead-blue">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-sans">
                            <Activity className="h-5 w-5 text-bead-blue" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
                            <div className="p-3 bg-secondary rounded-full border-2 border-border">
                                <Activity className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">No recent activity</p>
                                <p className="text-xs text-muted-foreground max-w-[200px]">
                                    Actions taken in the system will appear here automatically.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] border-t-4 border-t-bead-purple">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-sans">
                            <Calendar className="h-5 w-5 text-bead-purple" />
                            Upcoming Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
                            <div className="p-3 bg-secondary rounded-full border-2 border-border">
                                <Calendar className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">No classes today</p>
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
