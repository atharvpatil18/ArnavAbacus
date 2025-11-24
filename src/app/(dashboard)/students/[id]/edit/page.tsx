'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        email: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        dateOfBirth: '',
        address: '',
        status: 'ACTIVE'
    })

    useEffect(() => {
        params.then(p => setId(p.id))
    }, [params])

    useEffect(() => {
        if (!id) return

        const fetchStudent = async () => {
            try {
                const res = await fetch(`/api/students/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        name: data.name || '',
                        rollNumber: data.rollNumber || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        parentName: data.parentName || '',
                        parentPhone: data.parentPhone || '',
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                        address: data.address || '',
                        status: data.active ? 'ACTIVE' : 'INACTIVE'
                    })
                }
            } catch (error) {
                console.error('Failed to fetch student', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStudent()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    active: formData.status === 'ACTIVE'
                })
            })

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: 'Student profile updated successfully.',
                })
                router.push(`/students/${id}`)
                router.refresh()
            } else {
                throw new Error('Failed to update student')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update student profile.',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/students/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: 'Student deleted successfully.',
                })
                router.push('/students')
                router.refresh()
            } else {
                throw new Error('Failed to delete student')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete student.',
                variant: 'destructive',
            })
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/students/${id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
                        <p className="text-muted-foreground">Update student information.</p>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the student
                                and all associated data including attendance and fee records.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rollNumber">Roll Number</Label>
                                <Input
                                    id="rollNumber"
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parentName">Parent Name</Label>
                                <Input
                                    id="parentName"
                                    value={formData.parentName}
                                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parentPhone">Parent Phone</Label>
                                <Input
                                    id="parentPhone"
                                    value={formData.parentPhone}
                                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/students/${id}`}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={submitting}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
