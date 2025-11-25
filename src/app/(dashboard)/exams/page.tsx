'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, GraduationCap, Trophy, FileText } from 'lucide-react'
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

export default function ExamsPage() {
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch('/api/exams')
                if (res.ok) {
                    const data = await res.json()
                    setExams(data)
                }
            } catch (error) {
                console.error('Failed to fetch exams', error)
            } finally {
                setLoading(false)
            }
        }
        fetchExams()
    }, [])

    const filteredExams = exams.filter(exam => 
        exam.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.level.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Exams & Results</h2>
                    <p className="text-muted-foreground">
                        Manage student marks, level promotions, and trophy nominations.
                    </p>
                </div>
                <Button asChild className="bg-bead-green hover:bg-bead-green/90 text-white shadow-hard border-2 border-border">
                    <Link href="/exams/new">
                        <Plus className="mr-2 h-4 w-4" /> Record Exam
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search student or level..."
                        className="pl-8 border-2 border-border focus-visible:ring-0 focus-visible:border-bead-green"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-2 border-border shadow-hard">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-bead-green" />
                        Exam Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading exams...</div>
                    ) : filteredExams.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                            <p>No exam records found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 border-border hover:bg-transparent">
                                    <TableHead className="text-gray-900 font-bold">Student</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Level</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Marks</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Date</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Trophy</TableHead>
                                    <TableHead className="text-gray-900 font-bold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExams.map((exam) => (
                                    <TableRow key={exam.id} className="hover:bg-gray-50 border-b border-border/50">
                                        <TableCell className="font-medium">{exam.student.name}</TableCell>
                                        <TableCell>{exam.level}</TableCell>
                                        <TableCell>
                                            <span className={exam.marks >= 70 ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
                                                {exam.marks}/{exam.totalMarks}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {exam.trophyNomination && (
                                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex w-fit items-center gap-1">
                                                    <Trophy className="h-3 w-3" /> Nominated
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={exam.status === 'COMPLETED' ? 'default' : 'secondary'} 
                                                className={exam.status === 'COMPLETED' ? 'bg-bead-green hover:bg-bead-green/90 border-border' : ''}>
                                                {exam.status}
                                            </Badge>
                                        </TableCell>
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
