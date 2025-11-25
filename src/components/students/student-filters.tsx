'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8'];
const SORT_OPTIONS = [
    { value: 'createdAt-desc', label: 'Recently Added' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'dob-asc', label: 'Age (Youngest First)' },
    { value: 'dob-desc', label: 'Age (Oldest First)' },
    { value: 'joiningDate-desc', label: 'Joining Date (Newest)' },
    { value: 'joiningDate-asc', label: 'Joining Date (Oldest)' },
];

export function StudentFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentLevel = searchParams.get('level') || 'all';
    const currentActive = searchParams.get('active') || 'all';
    const currentSort = `${searchParams.get('sortBy') || 'createdAt'}-${searchParams.get('sortOrder') || 'desc'}`;

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
          params.delete(key);
      }
        router.push(`/students?${params.toString()}`);
    };

    const updateSort = (value: string) => {
        const [sortBy, sortOrder] = value.split('-');
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        router.push(`/students?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/students');
    };

    const hasFilters = currentLevel !== 'all' || currentActive !== 'all' || !!searchParams.get('query');

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {/* Level Filter */}
            <Select value={currentLevel} onValueChange={(val) => updateFilter('level', val)}>
                <SelectTrigger className="w-[180px]">
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

            {/* Active Filter */}
            <Select value={currentActive} onValueChange={(val) => updateFilter('active', val)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="true">Active Only</SelectItem>
                    <SelectItem value="false">Inactive Only</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={currentSort} onValueChange={updateSort}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
