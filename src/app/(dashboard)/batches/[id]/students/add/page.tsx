'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface Student {
    id: string
    name: string
    batchId: string | null
}

export default function AddStudentsToBatchPage({ params }: { params: Promise<{ id: string }> }) {
    const [batchId, setBatchId] = useState<string>('')
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        params.then(p => setBatchId(p.id))
    }, [params])

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/students')
                if (res.ok) {
                    const data = await res.json()
                    // Filter out students already in a batch (optional, depending on requirements)
                    // For now, show all, but maybe highlight those already assigned
                    setStudents(data)
                }
            } catch (error) {
                console.error('Failed to fetch students', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStudents()
    }, [])

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleStudent = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        )
    }

    const handleSubmit = async () => {
        if (selectedStudents.length === 0) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/batches/${batchId}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentIds: selectedStudents })
            })

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: `${selectedStudents.length} students added to batch.`,
                })
                router.push(`/batches/${batchId}`)
                router.refresh()
            } else {
                throw new Error('Failed to add students')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add students to batch.',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/batches/${batchId}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Students to Batch</h1>
                    <p className="text-muted-foreground">Select students to assign to this batch.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${selectedStudents.includes(student.id)
                                        ? 'bg-indigo-50 border-indigo-200'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleStudent(student.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={selectedStudents.includes(student.id)}
                                            onCheckedChange={() => toggleStudent(student.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                                    {student.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{student.name}</p>
                                                {student.batchId && (
                                                    <p className="text-xs text-amber-600">
                                                        Already in a batch
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No students found</p>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/batches/${batchId}`}>Cancel</Link>
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedStudents.length === 0 || submitting}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add {selectedStudents.length} Students
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
