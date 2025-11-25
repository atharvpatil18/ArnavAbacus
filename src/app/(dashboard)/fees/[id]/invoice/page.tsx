// app/(dashboard)/fees/[id]/invoice/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface FeeRecord {
    id: string;
    amount: number;
    dueDate: string;
    paidDate?: string | null;
    status: string;
    student: {
        name: string;
        level: string;
    };
}

export default function FeeInvoicePage({ params }: { params: { id: string } }) {
    const [fee, setFee] = useState<FeeRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchFee = async () => {
            try {
                const res = await fetch(`/api/fees/${params.id}`);
                if (!res.ok) throw new Error('Failed to load fee record');
                const data = await res.json();
                setFee(data);
            } catch (e: any) {
                setError(e.message);
            }
        };
        fetchFee();
    }, [params.id]);

    if (error) {
        return <div className="p-4 text-destructive">{error}</div>;
    }

    if (!fee) {
        return <div className="p-4">Loading receipt...</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Fee Receipt</h1>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="font-medium">Student:</p>
                    <p>{fee.student.name}</p>
                </div>
                <div>
                    <p className="font-medium">Level:</p>
                    <p>{fee.student.level}</p>
                </div>
                <div>
                    <p className="font-medium">Amount:</p>
                    <p>₹{fee.amount.toLocaleString()}</p>
                </div>
                <div>
                    <p className="font-medium">Due Date:</p>
                    <p>{format(new Date(fee.dueDate), 'PPP')}</p>
                </div>
                <div>
                    <p className="font-medium">Status:</p>
                    <p>{fee.status}</p>
                </div>
                {fee.paidDate && (
                    <div>
                        <p className="font-medium">Paid On:</p>
                        <p>{format(new Date(fee.paidDate), 'PPP')}</p>
                    </div>
                )}
            </div>
            <Button onClick={handlePrint}>Print Receipt</Button>
        </div>
    );
}
