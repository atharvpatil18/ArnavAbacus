'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function HomeworkPage() {
    const [homeworks, setHomeworks] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        accuracy: '',
        status: 'COMPLETED',
        remarks: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hwRes, stuRes] = await Promise.all([
                    fetch('/api/homework'),
                    fetch('/api/students')
                ])
                
                if (hwRes.ok) {
                    const data = await hwRes.json()
                    setHomeworks(data)
                }
                if (stuRes.ok) {
                    const data = await stuRes.json()
                    setStudents(data)
                }
            } catch (error) {
                console.error('Failed to fetch data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/homework', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const newHw = await res.json()
                // Refresh list
                const student = students.find(s => s.id === formData.studentId)
                setHomeworks([{ ...newHw, student: { name: student?.name } }, ...homeworks])
                setIsDialogOpen(false)
                setFormData({
                    studentId: '',
                    date: new Date().toISOString().split('T')[0],
                    accuracy: '',
                    status: 'COMPLETED',
                    remarks: ''
                })
            }
        } catch (error) {
            console.error('Failed to save homework', error)
        }
    }

    const filteredHomeworks = homeworks.filter(hw => 
        hw.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Homework Tracking</h2>
                    <p className="text-muted-foreground">
                        Monitor daily homework completion and accuracy.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                            <Plus className="mr-2 h-4 w-4" /> Log Homework
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] border-2 border-border shadow-hard">
                        <DialogHeader>
                            <DialogTitle>Log Homework Entry</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="student">Student</Label>
                                <Select 
                                    value={formData.studentId} 
                                    onValueChange={(val) => setFormData({...formData, studentId: val})}
                                >
                                    <SelectTrigger className="border-2 border-border">
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(val) => setFormData({...formData, status: val})}
                                    >
                                        <SelectTrigger className="border-2 border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="MISSED">Missed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accuracy">Accuracy (%)</Label>
                                <Input 
                                    id="accuracy" 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    value={formData.accuracy}
                                    onChange={(e) => setFormData({...formData, accuracy: e.target.value})}
                                    className="border-2 border-border"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Input 
                                    id="remarks" 
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                    className="border-2 border-border"
                                    placeholder="Optional notes"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                                Save Entry
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search student..."
                        className="pl-8 border-2 border-border focus-visible:ring-0 focus-visible:border-bead-green"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-2 border-border shadow-hard">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-bead-green" />
                        Homework Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading homework logs...</div>
                    ) : filteredHomeworks.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                            <p>No homework records found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 border-border hover:bg-transparent">
                                    <TableHead className="text-gray-900 font-bold">Student</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Date</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Status</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Accuracy</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHomeworks.map((hw) => (
                                    <TableRow key={hw.id} className="hover:bg-gray-50 border-b border-border/50">
                                        <TableCell className="font-medium">{hw.student.name}</TableCell>
                                        <TableCell>{new Date(hw.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                hw.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
                                                hw.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                'bg-red-100 text-red-800 border-red-200'
                                            }>
                                                {hw.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {hw.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                                                {hw.status === 'MISSED' && <XCircle className="h-3 w-3 mr-1" />}
                                                {hw.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {hw.accuracy !== null ? (
                                                <span className={hw.accuracy >= 80 ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
                                                    {hw.accuracy}%
                                                </span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{hw.remarks || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
