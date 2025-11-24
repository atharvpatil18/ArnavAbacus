'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, Users, Clock, MoreHorizontal, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

export default function BatchesPage() {
    const [searchTerm, setSearchTerm] = useState('')
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

    const filteredBatches = batches.filter(batch =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.level.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Batches</h2>
                    <p className="text-muted-foreground">
                        Manage class schedules and student assignments.
                    </p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/batches/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Batch
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search batches..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-gray-100" />
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : filteredBatches.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No batches found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new batch.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBatches.map((batch) => (
                        <Card key={batch.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {batch.name}
                                        </CardTitle>
                                        <Badge variant="secondary" className="mt-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                            {batch.level}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/batches/${batch.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit Batch</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Mark Attendance</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                        {batch.days}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                        {batch.timeSlot || 'Time not set'}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                                        {batch._count?.students || 0} Students Enrolled
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t bg-gray-50/50">
                                <Button asChild variant="ghost" className="w-full justify-between hover:text-indigo-600 hover:bg-indigo-50">
                                    <Link href={`/batches/${batch.id}`}>
                                        View Schedule <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
