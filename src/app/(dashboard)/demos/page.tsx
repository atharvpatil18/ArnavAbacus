'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users, Calendar, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

export default function DemosPage() {
    const [demos, setDemos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        timeSlot: '',
        studentName: '',
        parentName: '',
        contact: ''
    })

    useEffect(() => {
        const fetchDemos = async () => {
            try {
                const res = await fetch('/api/demos')
                if (res.ok) {
                    const data = await res.json()
                    setDemos(data)
                }
            } catch (error) {
                console.error('Failed to fetch demos', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDemos()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/demos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                // Refresh logic would be better here, but for now just reload
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to schedule demo', error)
        }
    }

    const handleConvert = async (studentId: string) => {
        try {
            const res = await fetch(`/api/demos/${studentId}/convert`, {
                method: 'POST'
            })
            if (res.ok) {
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to convert student', error)
        }
    }

    // Calculate stats
    const totalDemos = demos.length
    const totalStudents = demos.reduce((acc, demo) => acc + demo.students.length, 0)
    const convertedStudents = demos.reduce((acc, demo) => acc + demo.students.filter((s: any) => s.converted).length, 0)
    const conversionRate = totalStudents > 0 ? Math.round((convertedStudents / totalStudents) * 100) : 0

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Demo Classes</h2>
                    <p className="text-muted-foreground">
                        Manage demo sessions and track student conversions.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                            <Plus className="mr-2 h-4 w-4" /> Schedule Demo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] border-2 border-border shadow-hard">
                        <DialogHeader>
                            <DialogTitle>Schedule Demo Class</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input 
                                        id="date" 
                                        type="date" 
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="border-2 border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Time Slot</Label>
                                    <Input 
                                        id="time" 
                                        value={formData.timeSlot}
                                        onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                                        className="border-2 border-border"
                                        placeholder="e.g. 5 PM - 6 PM"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="student">Student Name</Label>
                                <Input 
                                    id="student" 
                                    value={formData.studentName}
                                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                                    className="border-2 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parent">Parent Name</Label>
                                <Input 
                                    id="parent" 
                                    value={formData.parentName}
                                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                                    className="border-2 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Number</Label>
                                <Input 
                                    id="contact" 
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                    className="border-2 border-border"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                                Schedule Demo
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-border shadow-hard">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Demos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDemos}</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-hard">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-hard">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-bead-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-bead-green">{conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">{convertedStudents} converted</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border-2 border-border bg-card shadow-hard overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary border-b-2 border-border">
                        <TableRow>
                            <TableHead className="font-bold">Date & Time</TableHead>
                            <TableHead className="font-bold">Teacher</TableHead>
                            <TableHead className="font-bold">Students</TableHead>
                            <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : demos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No demo classes found.</TableCell>
                                </TableRow>
                            ) : (
                                demos.map((demo) => (
                                <TableRow key={demo.id} className="border-b border-border hover:bg-muted/50">
                                    <TableCell>
                                        <div className="font-medium">{new Date(demo.date).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted-foreground">{demo.timeSlot}</div>
                                    </TableCell>
                                    <TableCell>{demo.teacher?.name || 'Unassigned'}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {demo.students.map((student: any) => (
                                                <div key={student.id} className="flex items-center gap-2 text-sm">
                                                    <span>{student.name}</span>
                                                    {student.converted ? (
                                                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Joined</Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost" 
                                                                className="h-5 px-2 text-[10px] hover:text-bead-green hover:bg-green-50"
                                                                onClick={() => handleConvert(student.id)}
                                                            >
                                                            Convert
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {demo.students.length === 0 && <span className="text-muted-foreground text-sm">No students</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
