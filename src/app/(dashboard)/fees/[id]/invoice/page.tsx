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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow print:shadow-none print:max-w-none print:p-0">
            {/* Print Header */}
            <div className="hidden print:block mb-8 text-center border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-wider">Arnav Abacus Academy</h1>
                <p className="text-sm mt-1">Excellence in Mental Arithmetic</p>
                <p className="text-xs mt-1 text-gray-600">123 Education Lane, Learning City, State - 400001</p>
                <p className="text-xs text-gray-600">Contact: +91 98765 43210 | Email: info@arnavabacus.com</p>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Fee Receipt</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Receipt No:</p>
                    <p className="font-mono font-bold">{fee.id.slice(-8).toUpperCase()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 p-4 border-2 border-gray-100 rounded-lg print:border-black">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Student Name</p>
                    <p className="font-bold text-lg">{fee.student.name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Level / Course</p>
                    <p className="font-medium">{fee.student.level}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${fee.status === 'PAID'
                        ? 'bg-green-100 text-green-800 border-green-200 print:border-black print:text-black print:bg-transparent'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                        {fee.status}
                    </span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Due Date</p>
                    <p className="font-medium">{format(new Date(fee.dueDate), 'PPP')}</p>
                </div>
                {fee.paidDate && (
                    <div className="col-span-2 border-t pt-4 mt-2 border-dashed border-gray-200 print:border-black">
                        <p className="text-sm text-gray-500 mb-1">Paid On</p>
                        <p className="font-medium">{format(new Date(fee.paidDate), 'PPP')}</p>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8 print:bg-transparent print:border-2 print:border-black">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Tuition Fee ({fee.student.level})</span>
                    <span className="font-medium">₹{fee.amount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 my-4 print:border-black"></div>
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span>₹{fee.amount.toLocaleString()}</span>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-12 pt-8 border-t-2 border-black">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-500">
                        <p>This is a computer generated receipt.</p>
                        <p>Generated on {format(new Date(), 'PPP p')}</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 w-32 border-b border-black mb-2"></div>
                        <p className="text-xs font-bold uppercase">Authorized Signatory</p>
                    </div>
                </div>
            </div>

            <Button onClick={handlePrint} className="w-full no-print">Print Receipt</Button>
        </div>
    );
}
