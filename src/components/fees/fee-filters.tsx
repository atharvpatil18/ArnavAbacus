
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const STATUSES = ['PAID', 'PENDING', 'OVERDUE'];
const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export function FeeFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentStatus = searchParams.get('status') || 'all';
    const currentMonth = searchParams.get('month') || 'all';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/fees?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/fees');
    };

    const hasFilters = currentStatus !== 'all' || currentMonth !== 'all' || !!searchParams.get('query');

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {/* Status Filter */}
            <Select value={currentStatus} onValueChange={(val) => updateFilter('status', val)}>
                <SelectTrigger className="w-[180px] border-2 border-border">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                            {status}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={currentMonth} onValueChange={(val) => updateFilter('month', val)}>
                <SelectTrigger className="w-[180px] border-2 border-border">
                    <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                            {month.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
