
'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportButtonProps {
    stats: any
}

export function ExportButton({ stats }: ExportButtonProps) {
    const handleExport = () => {
        const rows = [
            ['Metric', 'Value'],
            ['Total Students', stats.totalStudents],
            ['Active Students', stats.activeStudents],
            ['Total Batches', stats.totalBatches],
            ['Attendance Rate', `${stats.attendanceRate}%`],
            ['Total Revenue', `₹${stats.totalRevenue}`],
            [],
            ['Recent Attendance'],
            ['Date', 'Status'],
            ...stats.attendanceRecords.map((r: any) => [new Date(r.date).toLocaleDateString(), r.status]),
            [],
            ['Recent Revenue'],
            ['Date', 'Amount'],
            ...stats.feeRecords.map((r: any) => [r.paidDate ? new Date(r.paidDate).toLocaleDateString() : 'N/A', r.amount])
        ]

        const csvContent = "data:text/csv;charset=utf-8," 
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "report_data.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button onClick={handleExport} variant="outline" className="gap-2 border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] active:translate-y-[2px] active:shadow-none transition-all">
            <Download className="h-4 w-4" />
            Export CSV
        </Button>
    )
}
