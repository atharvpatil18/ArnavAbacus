'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const daysOfWeek = [
    { id: 'MON', label: 'Monday' },
    { id: 'TUE', label: 'Tuesday' },
    { id: 'WED', label: 'Wednesday' },
    { id: 'THU', label: 'Thursday' },
    { id: 'FRI', label: 'Friday' },
    { id: 'SAT', label: 'Saturday' },
    { id: 'SUN', label: 'Sunday' },
]

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Batch name must be at least 2 characters.',
    }),
    level: z.string().min(1, {
        message: 'Please select a level.',
    }),
    days: z.array(z.string()).refine((value) => value.length > 0, {
        message: 'You have to select at least one day.',
    }),
    timeSlot: z.string().min(1, {
        message: 'Time slot is required.',
    }),
    teacherId: z.string().min(1, {
        message: 'Please select a teacher.',
    }),
})

export default function AddBatchPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [teachers, setTeachers] = useState<any[]>([])

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await fetch('/api/users?role=TEACHER')
                if (res.ok) {
                    const data = await res.json()
                    setTeachers(data)
                }
            } catch (error) {
                console.error('Failed to fetch teachers', error)
            }
        }
        fetchTeachers()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            days: [],
            timeSlot: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch('/api/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                throw new Error('Failed to create batch')
            }

            toast({
                title: 'Success',
                description: 'Batch created successfully.',
                className: 'bg-green-500 text-white',
            })
            router.push('/batches')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to create batch. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Batch</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <FormItem>
                                        <FormLabel>Batch Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Level 1 - Mon/Wed Evening" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <FormItem>
                                            <FormLabel>Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                </FormControl>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="teacherId"
                                    render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <FormItem>
                                            <FormLabel>Teacher</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select teacher" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {teachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>
                                                            {teacher.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="timeSlot"
                                render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <FormItem>
                                        <FormLabel>Time Slot</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 4:00 PM - 5:00 PM" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Time duration of the class
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="days"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Days</FormLabel>
                                            <FormDescription>
                                                Select the days for this batch.
                                            </FormDescription>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {daysOfWeek.map((day) => (
                                                <FormField
                                                    key={day.id}
                                                    control={form.control}
                                                    name="days"
                                                    render={({ field }: { field: any }) => {
                                                        return (
                                                            <FormItem
                                                                key={day.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(day.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, day.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value: string) => value !== day.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {day.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Batch'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
