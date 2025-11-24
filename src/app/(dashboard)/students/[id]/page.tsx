import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CreditCard, User, Clock, Edit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { RevokeAccessButton } from '@/components/students/revoke-access-button'

async function getStudent(id: string) {
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            batch: true,
            parent: true,
            attendance: {
                orderBy: { date: 'desc' },
                take: 10
            },
            feeRecords: {
                orderBy: { dueDate: 'desc' },
                take: 10
            }
        }
    })

    if (!student) return null
    return student
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const student = await getStudent(id)

    if (!student) {
        notFound()
    }

    const initials = student.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()

    // Calculate attendance stats
    const totalAttendance = student.attendance.length
    const presentCount = student.attendance.filter((a: { status: string }) => a.status === 'PRESENT').length
    const attendanceRate = totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={student.active ? "default" : "secondary"} className={student.active ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                {student.active ? 'Active Student' : 'Inactive'}
                            </Badge>
                            <span className="text-muted-foreground text-sm">• Level {student.level}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={`/students/${student.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Link>
                    </Button>
                    <RevokeAccessButton
                        studentId={student.id}
                        studentName={student.name}
                        isActive={student.active}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-indigo-500" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Parent Name</p>
                                <p className="font-medium">{student.parent?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Contact Number</p>
                                <p className="font-medium">{student.contactNumber}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{student.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">
                                    {student.dob ? format(new Date(student.dob), 'PPP') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Joined Date</p>
                                <p className="font-medium">
                                    {format(new Date(student.createdAt), 'PPP')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4 text-pink-500" />
                                Enrolled Batches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {student.batch ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <span className="font-medium">{student.batch.name}</span>
                                        <Badge variant="outline">{student.batch.level}</Badge>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No batch assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="attendance"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Attendance
                            </TabsTrigger>
                            <TabsTrigger
                                value="fees"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Fee History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-indigo-600">{attendanceRate}%</div>
                                        <p className="text-xs text-muted-foreground">Based on recent classes</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Fee Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-emerald-600">Up to Date</div>
                                        <p className="text-xs text-muted-foreground">No pending dues</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="attendance" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Attendance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {student.attendance.length > 0 ? (
                                        <div className="space-y-4">
                                            {student.attendance.map((record: { id: string; date: Date; status: string }) => (
                                                <div key={record.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <Clock className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{format(new Date(record.date), 'PPP')}</p>
                                                            <p className="text-xs text-muted-foreground">{format(new Date(record.date), 'p')}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={record.status === 'PRESENT' ? 'default' : 'destructive'}>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">No attendance records found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="fees" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {student.feeRecords.length > 0 ? (
                                        <div className="space-y-4">
                                            {student.feeRecords.map((record: { id: string; amount: number; dueDate: Date; status: string; }) => (
                                                <div key={record.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                                                            <CreditCard className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">₹{record.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-muted-foreground">{format(new Date(record.dueDate), 'PPP')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={record.status === 'PAID' ? 'default' : 'secondary'} className={record.status === 'PAID' ? 'bg-emerald-500' : ''}>
                                                            {record.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">No fee records found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
