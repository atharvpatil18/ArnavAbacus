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

interface FeeRecord {
    id: string
    student: { name: string }
    amount: number
    date: string
    type: string
    status: string
}

export default function FeesPage() {
    const [fees, setFees] = useState<FeeRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const res = await fetch('/api/fees')
                if (res.ok) {
                    const data = await res.json()
                    setFees(data)
                }
            } catch (error) {
                console.error('Failed to fetch fees', error)
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
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/fees/new">
                        <Plus className="mr-2 h-4 w-4" /> Record Payment
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <span className="text-2xl font-bold text-gray-900">₹{totalCollected.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <span className="text-2xl font-bold text-gray-900">{pendingCount} Students</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-indigo-600" />
                            <span className="text-2xl font-bold text-gray-900">{fees.length}</span>
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

                <div className="rounded-md border bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading records...</TableCell>
                                </TableRow>
                            ) : filteredFees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No fee records found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredFees.map((fee) => (
                                    <TableRow key={fee.id}>
                                        <TableCell>{format(new Date(fee.date), 'PPP')}</TableCell>
                                        <TableCell className="font-medium">{fee.student.name}</TableCell>
                                        <TableCell>{fee.type}</TableCell>
                                        <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={fee.status === 'PAID' ? 'default' : 'secondary'} className={fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}>
                                                {fee.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                                {fee.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
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
