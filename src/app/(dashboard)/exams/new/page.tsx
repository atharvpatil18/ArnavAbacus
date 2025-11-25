'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { GraduationCap, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewExamPage() {
    const router = useRouter()
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        studentId: '',
        level: '',
        marks: '',
        totalMarks: '100',
        date: new Date().toISOString().split('T')[0],
        trophyNomination: false
    })

    useEffect(() => {
        const fetchStudents = async () => {
            const res = await fetch('/api/students')
            if (res.ok) {
                const data = await res.json()
                setStudents(data)
            }
        }
        fetchStudents()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push('/exams')
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to create exam', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/exams">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Record New Exam</h2>
                    <p className="text-muted-foreground">
                        Enter exam details and results.
                    </p>
                </div>
            </div>

            <Card className="border-2 border-border shadow-hard">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-bead-green" />
                        Exam Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Label htmlFor="level">Level</Label>
                                <Select 
                                    value={formData.level} 
                                    onValueChange={(val) => setFormData({...formData, level: val})}
                                >
                                    <SelectTrigger className="border-2 border-border">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8'].map((l) => (
                                            <SelectItem key={l} value={l}>{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Exam Date</Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="border-2 border-border"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="marks">Marks Obtained</Label>
                                <Input 
                                    id="marks" 
                                    type="number" 
                                    step="0.1"
                                    value={formData.marks}
                                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                                    className="border-2 border-border"
                                    placeholder="0.0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalMarks">Total Marks</Label>
                                <Input 
                                    id="totalMarks" 
                                    type="number" 
                                    value={formData.totalMarks}
                                    onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                                    className="border-2 border-border"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg bg-yellow-50/50">
                            <Checkbox 
                                id="trophy" 
                                checked={formData.trophyNomination}
                                onCheckedChange={(checked) => setFormData({...formData, trophyNomination: checked as boolean})}
                                className="border-2 border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white"
                            />
                            <Label htmlFor="trophy" className="font-medium cursor-pointer">Nominate for Trophy?</Label>
                        </div>

                        <Button type="submit" className="w-full bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border" disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Exam Result
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
