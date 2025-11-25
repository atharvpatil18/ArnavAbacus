'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange?: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page)
        } else {
            const params = new URLSearchParams(searchParams)
            params.set('page', page.toString())
            router.push(`?${params.toString()}`)
        }
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>
            <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
