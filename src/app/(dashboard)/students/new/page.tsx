'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
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
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    dob: z.date({
        // required_error: 'A date of birth is required.',
    }),
    gender: z.string().min(1, {
        message: 'Please select a gender.',
    }),
    contactNumber: z.string().min(10, {
        message: 'Contact number must be at least 10 digits.',
    }),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    level: z.string().min(1, {
        message: 'Please select a level.',
    }),
    parentName: z.string().min(2, {
        message: 'Parent name is required.',
    }),
    parentEmail: z.string().email({
        message: 'Invalid email address.',
    }),
})

export default function AddStudentPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            contactNumber: '',
            email: '',
            address: '',
            parentName: '',
            parentEmail: '',
        },
    })

    const [credentials, setCredentials] = useState<{ email: string, password: string } | null>(null)
    const [openCredentials, setOpenCredentials] = useState(false)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                throw new Error('Failed to create student')
            }

            const data = await res.json()

            toast({
                title: 'Success',
                description: 'Student created successfully.',
                className: 'bg-green-500 text-white',
            })

            if (data.credentials) {
                setCredentials(data.credentials)
                setOpenCredentials(true)
            } else {
                router.push('/students')
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to create student. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCloseCredentials = () => {
        setOpenCredentials(false)
        router.push('/students')
        router.refresh()
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <FormItem>
                                            <FormLabel>Student Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'PPP')
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date('1900-01-01')
                                                        }
                                                        initialFocus
                                                        captionLayout="dropdown"
                                                        fromYear={2000}
                                                        toYear={new Date().getFullYear()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }: { field: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="contactNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+91 9876543210" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Student Email (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="student@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St, City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Parent Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="parentName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parent Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Parent Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="parentEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parent Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="parent@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Student'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Dialog open={openCredentials} onOpenChange={handleCloseCredentials}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Parent Account Created</DialogTitle>
                        <DialogDescription>
                            A new parent account has been created. Please share these credentials with the parent.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="p-2 bg-muted rounded-md font-mono text-sm">
                                {credentials?.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="p-2 bg-muted rounded-md font-mono text-sm">
                                {credentials?.password}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCloseCredentials}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
