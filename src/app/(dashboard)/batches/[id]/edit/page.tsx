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

export default function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        level: '',
        days: '',
        time: '',
        status: 'ACTIVE'
    })

    useEffect(() => {
        params.then(p => setId(p.id))
    }, [params])

    useEffect(() => {
        if (!id) return

        const fetchBatch = async () => {
            try {
                const res = await fetch(`/api/batches/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        name: data.name || '',
                        level: data.level || '',
                        days: data.days || '',
                        time: data.time || '',
                        status: data.active ? 'ACTIVE' : 'INACTIVE'
                    })
                }
            } catch (error) {
                console.error('Failed to fetch batch', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBatch()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch(`/api/batches/${id}`, {
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
                    description: 'Batch updated successfully.',
                })
                router.push(`/batches/${id}`)
                router.refresh()
            } else {
                throw new Error('Failed to update batch')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update batch.',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/batches/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: 'Batch deleted successfully.',
                })
                router.push('/batches')
                router.refresh()
            } else {
                throw new Error('Failed to delete batch')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete batch.',
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
                        <Link href={`/batches/${id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Batch</h1>
                        <p className="text-muted-foreground">Update batch information.</p>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Batch
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the batch.
                                Students in this batch will be unassigned.
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
                    <CardTitle>Batch Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Batch Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="level">Level</Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Level 1">Level 1</SelectItem>
                                        <SelectItem value="Level 2">Level 2</SelectItem>
                                        <SelectItem value="Level 3">Level 3</SelectItem>
                                        <SelectItem value="Level 4">Level 4</SelectItem>
                                        <SelectItem value="Level 5">Level 5</SelectItem>
                                        <SelectItem value="Level 6">Level 6</SelectItem>
                                        <SelectItem value="Level 7">Level 7</SelectItem>
                                        <SelectItem value="Level 8">Level 8</SelectItem>
                                    </SelectContent>
                                </Select>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="days">Days</Label>
                                <Input
                                    id="days"
                                    placeholder="e.g. Mon, Wed, Fri"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    placeholder="e.g. 4:00 PM - 5:00 PM"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/batches/${id}`}>Cancel</Link>
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
