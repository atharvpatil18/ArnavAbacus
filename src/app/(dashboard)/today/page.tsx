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
        const days = batch.days.split(',').map(d => d.trim().toLowerCase())
        // Debug log for development
        // console.log(`Checking batch ${batch.name}: days=[${days}], today=${dayName.toLowerCase()}`)
        return days.includes(dayName.toLowerCase())
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
    const dayName = format(new Date(), 'EEEE')

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
                <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl">
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground font-medium">No batches scheduled for {dayName}.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <Card key={batch.id} className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl hover:-translate-y-1 transition-transform duration-200">
                            <CardHeader className="bg-secondary/50 border-b-2 border-border pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-lg font-bold font-sans">{batch.name}</span>
                                    <Badge variant="outline" className="bg-bead-green text-white border-2 border-border shadow-sm font-bold">
                                        {batch.students.length} Students
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <div className="p-1.5 bg-bead-blue/10 rounded-md border border-bead-blue/20">
                                        <Clock className="h-4 w-4 text-bead-blue" />
                                    </div>
                                    <span>{batch.timeSlot || 'No time set'}</span>
                                </div>

                                {batch.level && (
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <div className="p-1.5 bg-bead-purple/10 rounded-md border border-bead-purple/20">
                                            <Users className="h-4 w-4 text-bead-purple" />
                                        </div>
                                        <span>Level: {batch.level}</span>
                                    </div>
                                )}

                                {session.user.role === 'ADMIN' && batch.teacher && (
                                    <div className="text-sm text-muted-foreground font-medium pl-1">
                                        Teacher: {batch.teacher.name}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button asChild size="sm" className="flex-1 bg-bead-green hover:bg-bead-green/90 text-white border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] active:translate-y-[2px] active:shadow-none transition-all">
                                        <Link href={`/attendance/mark/${batch.id}`}>
                                            Mark Attendance
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="flex-1 border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] active:translate-y-[2px] active:shadow-none transition-all bg-white hover:bg-secondary">
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
