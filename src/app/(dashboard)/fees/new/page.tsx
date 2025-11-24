'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface Student {
    id: string
    name: string
}

export default function RecordPaymentPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        type: 'MONTHLY_FEE',
        remarks: ''
    })

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/students')
                if (res.ok) {
                    const data = await res.json()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch('/api/fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    date: new Date().toISOString(),
                    status: 'PAID'
                })
            })

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: 'Payment recorded successfully.',
                })
                router.push('/fees')
                router.refresh()
            } else {
                throw new Error('Failed to record payment')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to record payment.',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/fees">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Record Payment</h1>
                    <p className="text-muted-foreground">Enter details for a new fee payment.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="student">Select Student</Label>
                            <Select
                                value={formData.studentId}
                                onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(student => (
                                        <SelectItem key={student.id} value={student.id}>
                                            {student.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Payment Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY_FEE">Monthly Fee</SelectItem>
                                        <SelectItem value="ADMISSION_FEE">Admission Fee</SelectItem>
                                        <SelectItem value="EXAM_FEE">Exam Fee</SelectItem>
                                        <SelectItem value="MATERIAL_FEE">Material Fee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Input
                                id="remarks"
                                placeholder="e.g. Cash payment, UPI transaction ID"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/fees">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={submitting}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Payment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
