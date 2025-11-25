'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentFilters } from '@/components/students/student-filters'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton'

import { Suspense } from 'react'

function StudentsContent() {
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true)
            try {
                // Build query string from search params
                const params = new URLSearchParams()
                if (searchTerm) params.set('query', searchTerm)

                // Add pagination params
                const currentPage = searchParams.get('page') || '1'
                params.set('page', currentPage)
                setPage(parseInt(currentPage))

                // Add filters from URL
                searchParams.forEach((value, key) => {
                    if (key !== 'query' && key !== 'page') {
                        params.set(key, value)
                    }
                })

                const res = await fetch(`/api/students?${params.toString()}`)
                if (res.ok) {
                    const { data, meta } = await res.json()
                    setStudents(data)
                    setTotalPages(meta.totalPages)
                    setError(null)
                } else {
                    setError('Failed to load students')
                }
            } catch (error) {
                console.error('Failed to fetch students', error)
                setError('Failed to load students')
            } finally {
                setLoading(false)
            }
        }
        fetchStudents()
    }, [searchTerm, searchParams])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Students</h2>
                    <p className="text-muted-foreground">
                        Manage student records, attendance, and fees.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/students/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search students..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                <StudentFilters />
            </div>

            <div className="rounded-xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_var(--border)] overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary border-b-2 border-border">
                        <TableRow className="hover:bg-secondary">
                            <TableHead className="text-secondary-foreground font-bold">Name</TableHead>
                            <TableHead className="text-secondary-foreground font-bold hidden md:table-cell">Level</TableHead>
                            <TableHead className="text-secondary-foreground font-bold hidden md:table-cell">Batch</TableHead>
                            <TableHead className="text-secondary-foreground font-bold">Status</TableHead>
                            <TableHead className="text-secondary-foreground font-bold hidden lg:table-cell">Last Attendance</TableHead>
                            <TableHead className="text-secondary-foreground font-bold hidden lg:table-cell">Fees</TableHead>
                            <TableHead className="text-right text-secondary-foreground font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="p-0">
                                    <div className="p-4">
                                        <TableSkeleton columnCount={7} rowCount={10} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student: any) => (
                                <TableRow key={student.id} className="border-b border-border hover:bg-muted/50 even:bg-muted/30">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 rounded-lg border-2 border-border">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`} alt={student.name} />
                                                <AvatarFallback className="rounded-lg">{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/students/${student.id}`} className="font-bold hover:underline text-foreground">
                                                    {student.name}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">{student.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell font-medium">{student.level || 'N/A'}</TableCell>
                                    <TableCell className="hidden md:table-cell">{student.batch?.name || 'Unassigned'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            className="p-0 h-auto hover:bg-transparent"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`/api/students/${student.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ active: !student.active })
                                                    })
                                                    if (res.ok) {
                                                        setStudents(students.map(s =>
                                                            s.id === student.id ? { ...s, active: !s.active } : s
                                                        ))
                                                    }
                                                } catch (err) {
                                                    console.error('Failed to toggle status', err)
                                                }
                                            }}
                                        >
                                            <Badge variant={student.active ? 'default' : 'secondary'} className={student.active ? 'bg-bead-green hover:bg-bead-green/90 border-border cursor-pointer' : 'cursor-pointer'}>
                                                {student.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </Button>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">N/A</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <Badge variant={student.feeRecords?.length > 0 ? 'destructive' : 'default'} className={student.feeRecords?.length > 0 ? 'bg-red-500' : 'bg-emerald-500'}>
                                            {student.feeRecords?.length > 0 ? 'Pending' : 'Paid'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted border-2 border-transparent hover:border-border">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="focus:bg-secondary focus:text-secondary-foreground cursor-pointer">
                                                    <Link href={`/students/${student.id}`}>View Profile</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="focus:bg-secondary focus:text-secondary-foreground cursor-pointer">
                                                    <Link href={`/students/${student.id}/edit`}>Edit Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border" />
                                                {session?.user?.role !== 'PARENT' && (
                                                    <DropdownMenuItem className="focus:bg-secondary focus:text-secondary-foreground cursor-pointer">Mark Attendance</DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="focus:bg-secondary focus:text-secondary-foreground cursor-pointer">Record Fee Payment</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} />
        </div>
    )
}

export default function StudentsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading students...</div>
            </div>
        }>
            <StudentsContent />
        </Suspense>
    )
}
