'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Batch {
    id: string
    name: string
    level: string
    days: string
    timeSlot: string
    _count?: {
        students: number
    }
}

export default function AttendancePage() {
    const [batches, setBatches] = useState<Batch[]>([])
    const [loading, setLoading] = useState(true)

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
            } finally {
                setLoading(false)
            }
        }
        fetchBatches()
    }, [])

    // Filter batches for today (mock logic for now, ideally backend filters)
    // For now, just show all batches as "Today's Classes" for demo
    const todayBatches = batches

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
                    <p className="text-muted-foreground">
                        Mark attendance for today's classes.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/attendance/calendar">
                            <Calendar className="mr-2 h-4 w-4" />
                            View Calendar
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p>Loading classes...</p>
                ) : todayBatches.length === 0 ? (
                    <p>No classes scheduled for today.</p>
                ) : (
                    todayBatches.map((batch) => (
                        <Card key={batch.id} className="border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                                    <Badge variant="outline">{batch.level}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {batch.timeSlot || 'Time not set'}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {batch.days}
                                    </div>
                                    <Button asChild className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                                        <Link href={`/attendance/mark/${batch.id}`}>
                                            Mark Attendance <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
