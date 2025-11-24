import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

async function getTodaysBatches(teacherId?: string) {
    const today = new Date()
    const dayName = format(today, 'EEEE') // e.g., "Monday"

    const where: any = {}

    // Filter by teacher if teacherId is provided
    if (teacherId) {
        where.teacherId = teacherId
    }

    const allBatches = await prisma.batch.findMany({
        where,
        include: {
            students: {
                where: { active: true },
                select: {
                    id: true,
                    name: true
                }
            },
            teacher: {
                select: {
                    name: true
                }
            }
        }
    })

    // Filter batches that have today's day in their schedule
    const todaysBatches = allBatches.filter(batch => {
        if (!batch.days) return false
        const days = batch.days.split(',').map(d => d.trim())
        return days.includes(dayName)
    })

    return todaysBatches
}

export default async function TodaySchedulePage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    // Only teachers and admins can access this page
    if (session.user.role === 'PARENT') {
        redirect('/students')
    }

    // If teacher, show only their batches
    const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined
    const batches = await getTodaysBatches(teacherId)

    const today = format(new Date(), 'EEEE, MMMM dd, yyyy')

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Today's Schedule</h2>
                <p className="text-muted-foreground mt-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {today}
                </p>
            </div>

            {batches.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No batches scheduled for today.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <Card key={batch.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-lg">{batch.name}</span>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        {batch.students.length} Students
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{batch.timeSlot || 'No time set'}</span>
                                </div>

                                {batch.level && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>Level: {batch.level}</span>
                                    </div>
                                )}

                                {session.user.role === 'ADMIN' && batch.teacher && (
                                    <div className="text-sm text-muted-foreground">
                                        Teacher: {batch.teacher.name}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button asChild size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                        <Link href={`/attendance/mark/${batch.id}`}>
                                            Mark Attendance
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="flex-1">
                                        <Link href={`/batches/${batch.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
