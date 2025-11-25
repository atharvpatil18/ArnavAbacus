'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
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
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function FinancePage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 })
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        amount: '',
        category: 'MISC',
        description: '',
        date: new Date().toISOString().split('T')[0]
    })

    const fetchData = async () => {
        try {
            const [expRes, statsRes] = await Promise.all([
                fetch('/api/finance/expenses'),
                fetch('/api/finance/stats')
            ])
            
            if (expRes.ok) {
                const data = await expRes.json()
                setExpenses(data)
            }
            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch finance data', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsDialogOpen(false)
                setFormData({
                    amount: '',
                    category: 'MISC',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                })
                fetchData() // Refresh all data
            }
        } catch (error) {
            console.error('Failed to save expense', error)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Finance & Expenses</h2>
                    <p className="text-muted-foreground">
                        Track academy expenses and monitor financial health.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] border-2 border-border shadow-hard">
                        <DialogHeader>
                            <DialogTitle>Record Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (₹)</Label>
                                    <Input 
                                        id="amount" 
                                        type="number" 
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="border-2 border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input 
                                        id="date" 
                                        type="date" 
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="border-2 border-border"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={formData.category} 
                                    onValueChange={(val) => setFormData({...formData, category: val})}
                                >
                                    <SelectTrigger className="border-2 border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RENT">Rent</SelectItem>
                                        <SelectItem value="SALARY">Salary</SelectItem>
                                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                        <SelectItem value="MARKETING">Marketing</SelectItem>
                                        <SelectItem value="MISC">Miscellaneous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                    id="description" 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="border-2 border-border"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                                Save Expense
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-border shadow-hard bg-green-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">₹{stats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-green-600 font-medium">All time collected fees</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-hard bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-900">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">₹{stats.expenses.toLocaleString()}</div>
                        <p className="text-xs text-red-600 font-medium">All time expenses</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-hard bg-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Net Profit</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">₹{stats.profit.toLocaleString()}</div>
                        <p className="text-xs text-blue-600 font-medium">Revenue - Expenses</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-border shadow-hard">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-bead-green" />
                        Expense History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading expenses...</div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                            <p>No expenses recorded.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 border-border hover:bg-transparent">
                                    <TableHead className="text-gray-900 font-bold">Date</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Category</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Description</TableHead>
                                    <TableHead className="text-gray-900 font-bold text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((exp) => (
                                    <TableRow key={exp.id} className="hover:bg-gray-50 border-b border-border/50">
                                        <TableCell className="font-medium">{new Date(exp.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{exp.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{exp.description || '-'}</TableCell>
                                        <TableCell className="text-right font-bold text-red-600">-₹{exp.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
