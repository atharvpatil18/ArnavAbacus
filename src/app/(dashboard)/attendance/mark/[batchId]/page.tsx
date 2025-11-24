'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Check, X, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { format } from 'date-fns'

interface Student {
    id: string
    name: string
    active: boolean
}

interface Batch {
    id: string
    name: string
    students: Student[]
}

export default function MarkAttendancePage({ params }: { params: Promise<{ batchId: string }> }) {
    const [batchId, setBatchId] = useState<string>('')
    const [batch, setBatch] = useState<Batch | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({})
    const router = useRouter()
    const { toast } = useToast()
    const today = new Date()

    useEffect(() => {
        params.then(p => setBatchId(p.batchId))
    }, [params])

    useEffect(() => {
        if (!batchId) return

        const fetchBatch = async () => {
            try {
                const res = await fetch(`/api/batches/${batchId}`)
                if (res.ok) {
                    const data = await res.json()
                    setBatch(data)
                    // Initialize all students as PRESENT
                    const initialAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
                    data.students.forEach((s: Student) => {
                        initialAttendance[s.id] = 'PRESENT'
                    })
                    setAttendance(initialAttendance)
                }
            } catch (error) {
                console.error('Failed to fetch batch', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBatch()
    }, [batchId])

    const updateStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }))
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status,
                date: new Date().toISOString(),
                batchId
            }))

            const res = await fetch('/api/attendance/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records })
            })

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: 'Attendance marked successfully.',
                })
                router.push('/attendance')
                router.refresh()
            } else {
                throw new Error('Failed to mark attendance')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit attendance.',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!batch) {
        return <div>Batch not found</div>
    }

    const presentCount = Object.values(attendance).filter(s => s === 'PRESENT').length
    const absentCount = Object.values(attendance).filter(s => s === 'ABSENT').length

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/attendance">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
                    <p className="text-muted-foreground">
                        {batch.name} • {format(today, 'PPP')}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Student List</CardTitle>
                                <div className="flex gap-2 text-sm">
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Present: {presentCount}
                                    </Badge>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        Absent: {absentCount}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {batch.students.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                                    {student.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{student.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={attendance[student.id] === 'PRESENT' ? 'default' : 'outline'}
                                                className={attendance[student.id] === 'PRESENT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:text-emerald-600 hover:bg-emerald-50'}
                                                onClick={() => updateStatus(student.id, 'PRESENT')}
                                            >
                                                <Check className="h-4 w-4 mr-1" /> Present
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={attendance[student.id] === 'ABSENT' ? 'destructive' : 'outline'}
                                                className={attendance[student.id] === 'ABSENT' ? '' : 'hover:text-red-600 hover:bg-red-50'}
                                                onClick={() => updateStatus(student.id, 'ABSENT')}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Absent
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={attendance[student.id] === 'LATE' ? 'secondary' : 'outline'}
                                                className={attendance[student.id] === 'LATE' ? 'bg-amber-100 text-amber-800' : 'hover:text-amber-600 hover:bg-amber-50'}
                                                onClick={() => updateStatus(student.id, 'LATE')}
                                            >
                                                <Clock className="h-4 w-4 mr-1" /> Late
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {batch.students.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">No students in this batch.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Students</span>
                                    <span className="font-medium">{batch.students.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Marked Present</span>
                                    <span className="font-medium text-emerald-600">{presentCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Marked Absent</span>
                                    <span className="font-medium text-red-600">{absentCount}</span>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleSubmit}
                                disabled={submitting || batch.students.length === 0}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Attendance
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
