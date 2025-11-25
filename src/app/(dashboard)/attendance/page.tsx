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
                    <p className="text-muted-foreground font-medium">Loading classes...</p>
                ) : todayBatches.length === 0 ? (
                        <p className="text-muted-foreground font-medium">No classes scheduled for today.</p>
                ) : (
                    todayBatches.map((batch) => (
                        <Card key={batch.id} className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl hover:-translate-y-1 transition-transform duration-200 overflow-hidden">
                            <div className="h-2 bg-bead-green w-full border-b-2 border-border" />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold font-sans">{batch.name}</CardTitle>
                                    <Badge variant="outline" className="bg-secondary text-secondary-foreground border-2 border-border font-bold">
                                        {batch.level}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm font-medium text-foreground">
                                        <div className="p-1.5 bg-bead-blue/10 rounded-md border border-bead-blue/20 mr-2">
                                            <Clock className="h-4 w-4 text-bead-blue" />
                                        </div>
                                        {batch.timeSlot || 'Time not set'}
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-foreground">
                                        <div className="p-1.5 bg-bead-purple/10 rounded-md border border-bead-purple/20 mr-2">
                                            <Calendar className="h-4 w-4 text-bead-purple" />
                                        </div>
                                        {batch.days}
                                    </div>
                                    <Button asChild className="w-full mt-4 bg-bead-green hover:bg-bead-green/90 text-white border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] active:translate-y-[2px] active:shadow-none transition-all font-bold">
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
