
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Abacus Level 1', 'Abacus Level 2', 'Abacus Level 3', 'Mental Math'];

export function ExamFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSubject = searchParams.get('subject') || 'all';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/exams?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/exams');
    };

    const hasFilters = currentSubject !== 'all' || !!searchParams.get('query');

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {/* Subject Filter */}
            <Select value={currentSubject} onValueChange={(val) => updateFilter('subject', val)}>
                <SelectTrigger className="w-[180px] border-2 border-border">
                    <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                            {subject}
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
