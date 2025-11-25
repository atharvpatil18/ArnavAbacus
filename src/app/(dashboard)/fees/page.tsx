'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
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
} from '@/components/ui/table'
import { format } from 'date-fns'
import { RoleGate } from '@/components/auth/role-gate'

interface FeeRecord {
    id: string
    student: { name: string; level: string }
    amount: number
    dueDate: string
    paidDate?: string | null
    cycle: string
    status: string
}

export default function FeesPage() {
    const [fees, setFees] = useState<FeeRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const res = await fetch('/api/fees')
                if (res.ok) {
                    const data = await res.json()
                    setFees(data)
                    setError(null)
                } else {
                    setError('Failed to load fee records')
                }
            } catch (error) {
                console.error('Failed to fetch fees', error)
                setError('Failed to load fee records')
            } finally {
                setLoading(false)
            }
        }
        fetchFees()
    }, [])

    const filteredFees = fees.filter(fee =>
        fee.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalCollected = fees.reduce((acc, fee) => fee.status === 'PAID' ? acc + fee.amount : acc, 0)
    const pendingCount = fees.filter(fee => fee.status === 'PENDING').length

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Fee Management</h2>
                    <p className="text-muted-foreground">
                        Track payments, dues, and financial records.
                    </p>
                </div>
                <RoleGate allowedRoles={['ADMIN']}>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/fees/new">
                            <Plus className="mr-2 h-4 w-4" /> Record Payment
                        </Link>
                    </Button>
                </RoleGate>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl hover:-translate-y-1 transition-transform duration-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground font-sans">Total Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-bead-green/10 rounded-lg border-2 border-bead-green/20">
                                <TrendingUp className="h-5 w-5 text-bead-green" />
                            </div>
                            <span className="text-3xl font-bold text-foreground font-sans">₹{totalCollected.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl hover:-translate-y-1 transition-transform duration-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground font-sans">Pending Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-bead-yellow/10 rounded-lg border-2 border-bead-yellow/20">
                                <AlertCircle className="h-5 w-5 text-bead-yellow" />
                            </div>
                            <span className="text-3xl font-bold text-foreground font-sans">{pendingCount} Students</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl hover:-translate-y-1 transition-transform duration-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground font-sans">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-bead-blue/10 rounded-lg border-2 border-bead-blue/20">
                                <CreditCard className="h-5 w-5 text-bead-blue" />
                            </div>
                            <span className="text-3xl font-bold text-foreground font-sans">{fees.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_var(--border)] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary border-b-2 border-border">
                            <TableRow className="hover:bg-secondary">
                                <TableHead className="text-secondary-foreground font-bold">Due Date</TableHead>
                                <TableHead className="text-secondary-foreground font-bold">Student</TableHead>
                                <TableHead className="text-secondary-foreground font-bold">Cycle</TableHead>
                                <TableHead className="text-secondary-foreground font-bold">Amount</TableHead>
                                <TableHead className="text-secondary-foreground font-bold">Status</TableHead>
                                <TableHead className="text-right text-secondary-foreground font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading records...</TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-destructive">{error}</TableCell>
                                </TableRow>
                            ) : filteredFees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No fee records found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredFees.map((fee) => (
                                    <TableRow key={fee.id} className="border-b border-border hover:bg-muted/50 even:bg-muted/30">
                                        <TableCell>{format(new Date(fee.dueDate), 'PPP')}</TableCell>
                                        <TableCell className="font-bold text-foreground">{fee.student.name}</TableCell>
                                        <TableCell>{fee.cycle}</TableCell>
                                        <TableCell className="font-mono font-bold">₹{fee.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={fee.status === 'PAID' ? 'default' : 'secondary'} className={fee.status === 'PAID' ? 'bg-bead-green text-white border-2 border-border' : 'bg-bead-yellow text-white border-2 border-border'}>
                                                {fee.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                                {fee.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="hover:bg-muted border-2 border-transparent hover:border-border">
                                                <Link href={`/fees/${fee.id}/invoice`}>View Receipt</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
