
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function BatchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentLevel = searchParams.get('level') || 'all';
    const currentDay = searchParams.get('day') || 'all';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/batches?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/batches');
    };

    const hasFilters = currentLevel !== 'all' || currentDay !== 'all' || !!searchParams.get('query');

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {/* Level Filter */}
            <Select value={currentLevel} onValueChange={(val) => updateFilter('level', val)}>
                <SelectTrigger className="w-[180px] border-2 border-border">
                    <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                            {level}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Day Filter */}
            <Select value={currentDay} onValueChange={(val) => updateFilter('day', val)}>
                <SelectTrigger className="w-[180px] border-2 border-border">
                    <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                            {day}
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
