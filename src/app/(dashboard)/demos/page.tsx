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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div>Loading demos...</div>
                ) : demos.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <p>No demo classes scheduled.</p>
                    </div>
                ) : (
                    demos.map((demo) => (
                        <Card key={demo.id} className="border-2 border-border shadow-hard">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-bead-green" />
                                        {new Date(demo.date).toLocaleDateString()}
                                    </CardTitle>
                                    <Badge variant="outline">{demo.timeSlot}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        Teacher: {demo.teacher?.name || 'Unassigned'}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Attendees</h4>
                                        {demo.students.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No students added.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {demo.students.map((student: any) => (
                                                    <div key={student.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-border">
                                                        <div>
                                                            <p className="font-medium">{student.name}</p>
                                                            <p className="text-xs text-muted-foreground">{student.contact}</p>
                                                        </div>
                                                        {student.converted ? (
                                                            <Badge className="bg-green-100 text-green-800 border-green-200">Joined</Badge>
                                                        ) : (
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost" 
                                                                className="h-6 text-xs hover:text-bead-green hover:bg-green-50"
                                                                onClick={() => handleConvert(student.id)}
                                                            >
                                                                Convert <ArrowRight className="ml-1 h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
