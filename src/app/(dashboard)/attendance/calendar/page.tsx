'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns'
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AttendanceRecord {
    id: string
    date: string
    status: string
    student: {
        id: string
        name: string
    }
    batch: {
        id: string
        name: string
        timeSlot: string
    }
}

interface Batch {
    id: string
    name: string
}

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [month, setMonth] = useState<Date>(new Date())
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [batches, setBatches] = useState<Batch[]>([])
    const [selectedBatch, setSelectedBatch] = useState<string>('all')

    // Fetch batches for filter
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch('/api/batches')
                if (res.ok) {
                    const data = await res.json()
                    setBatches(data)
                }
            } catch (error) {
                console.error('Failed to fetch batches', error)
            }
        }
        fetchBatches()
    }, [])

    // Fetch attendance for the month
    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true)
            try {
                const start = startOfMonth(month)
                const end = endOfMonth(month)

                let url = `/api/attendance?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
                if (selectedBatch && selectedBatch !== 'all') {
                    url += `&batchId=${selectedBatch}`
                }

                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data)) {
                        setAttendanceData(data)
                    } else {
                        console.error('Attendance data is not an array:', data)
                        setAttendanceData([])
                    }
                } else {
                    console.error('Failed to fetch attendance:', res.statusText)
                    setAttendanceData([])
                }
            } catch (error) {
                console.error('Failed to fetch attendance', error)
                setAttendanceData([])
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [month, selectedBatch])

    // Get records for selected date
    const selectedDateRecords = attendanceData.filter(record =>
        date && isSameDay(new Date(record.date), date)
    )

    // Get days with attendance for highlighting
    const daysWithAttendance = attendanceData.reduce((acc, record) => {
        const dateStr = format(new Date(record.date), 'yyyy-MM-dd')
        if (!acc[dateStr]) {
            acc[dateStr] = { present: 0, absent: 0, late: 0 }
        }
        if (record.status === 'PRESENT') acc[dateStr].present++
        else if (record.status === 'ABSENT') acc[dateStr].absent++
        else if (record.status === 'LATE') acc[dateStr].late++
        return acc
    }, {} as Record<string, { present: number, absent: number, late: number }>)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Attendance Calendar</h2>
                    <p className="text-muted-foreground">
                        View attendance history by month.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Daily View
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[350px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Month & Batch</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Batch Filter</label>
                                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Batches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        {batches.map(batch => (
                                            <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-center p-2 border rounded-md">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    month={month}
                                    onMonthChange={setMonth}
                                    className="rounded-md border shadow-sm"
                                    modifiers={{
                                        hasData: (date) => {
                                            const dateStr = format(date, 'yyyy-MM-dd')
                                            return !!daysWithAttendance[dateStr]
                                        }
                                    }}
                                    modifiersStyles={{
                                        hasData: {
                                            fontWeight: 'bold',
                                            backgroundColor: 'var(--bead-green)',
                                            color: 'white',
                                            borderRadius: '50%'
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>
                                    {date ? format(date, 'PPPP') : 'Select a date'}
                                </span>
                                {date && (
                                    <Badge variant="outline">
                                        {selectedDateRecords.length} Records
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : !date ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                    <p>Select a date from the calendar to view details</p>
                                </div>
                            ) : selectedDateRecords.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No attendance records found for this date.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedDateRecords.map(record => (
                                        <div key={record.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' :
                                                        record.status === 'ABSENT' ? 'bg-red-100 text-red-600' :
                                                            'bg-yellow-100 text-yellow-600'
                                                    }`}>
                                                    {record.status === 'PRESENT' ? <CheckCircle className="h-4 w-4" /> :
                                                        record.status === 'ABSENT' ? <XCircle className="h-4 w-4" /> :
                                                            <Clock className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{record.student.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="secondary" className="text-[10px] h-5">
                                                            {record.batch.name}
                                                        </Badge>
                                                        <span>{record.batch.timeSlot}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={
                                                record.status === 'PRESENT' ? 'default' :
                                                    record.status === 'ABSENT' ? 'destructive' :
                                                        'secondary'
                                            } className={record.status === 'PRESENT' ? 'bg-emerald-500' : ''}>
                                                {record.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
