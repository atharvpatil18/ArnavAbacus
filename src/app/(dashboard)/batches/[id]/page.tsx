import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, UserPlus, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

async function getBatch(id: string) {
    const batch = await prisma.batch.findUnique({
        where: { id },
        include: {
            students: true,
            _count: {
                select: { students: true }
            }
        }
    })

    if (!batch) return null
    return batch
}

export default async function BatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const batch = await getBatch(id)

    if (!batch) {
        notFound()
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-lg px-3 py-1">
                            {batch.level}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Batch Details and Student List
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href={`/attendance/mark/${batch.id}`}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Attendance
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/batches/${batch.id}/students/add`}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Students
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Schedule Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Days</p>
                                <p className="font-semibold">{batch.days}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Time</p>
                                <p className="font-semibold">{batch.timeSlot || 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Students</p>
                                <p className="font-semibold">{batch._count.students} Enrolled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Enrolled Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {batch.students.length > 0 ? (
                            <div className="divide-y">
                                {batch.students.map((student: { id: string; name: string; email: string | null }) => (
                                    <div key={student.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 bg-indigo-100 text-indigo-600">
                                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/students/${student.id}`} className="font-medium hover:underline">
                                                    {student.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">{student.email || 'No email'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/students/${student.id}`}>View Profile</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                <p>No students enrolled in this batch yet.</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link href={`/batches/${batch.id}/students/add`}>
                                        Add students now
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
