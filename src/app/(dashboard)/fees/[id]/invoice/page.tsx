import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import Link from 'next/link'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const feeRecord = await prisma.feeRecord.findUnique({
        where: { id },
        include: {
            student: {
                include: {
                    parent: true,
                    batch: true
                }
            }
        }
    })

    if (!feeRecord) {
        notFound()
    }

    const student = feeRecord.student
    const invoiceNumber = `INV-${feeRecord.id.slice(-6).toUpperCase()}`

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg my-8 print:shadow-none print:my-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-indigo-600">Arnav Abacus Academy</h1>
                    <p className="text-gray-500 mt-2">Excellence in Mental Arithmetic</p>
                    <div className="mt-4 text-sm text-gray-600">
                        <p>123 Education Lane</p>
                        <p>Knowledge City, KC 45678</p>
                        <p>Phone: +91 98765 43210</p>
                        <p>Email: info@arnavabacus.com</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold text-gray-900">INVOICE</h2>
                    <p className="text-gray-500 mt-1">#{invoiceNumber}</p>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">Date: {format(new Date(), 'PPP')}</p>
                        <p className="text-sm text-gray-600">Due Date: {format(new Date(feeRecord.dueDate), 'PPP')}</p>
                    </div>
                </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
                <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
                <div className="text-gray-900">
                    <p className="font-bold text-lg">{student.name}</p>
                    <p>Parent: {student.parent?.name || 'N/A'}</p>
                    <p>{student.address || 'No address provided'}</p>
                    <p>{student.contactNumber}</p>
                </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 font-semibold text-gray-600">Description</th>
                        <th className="text-right py-3 font-semibold text-gray-600">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100">
                        <td className="py-4 text-gray-900">
                            <p className="font-medium">Tuition Fee - {feeRecord.cycle}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Batch: {student.batch?.name || 'N/A'} ({student.batch?.level || 'N/A'})
                            </p>
                            {feeRecord.month && feeRecord.year && (
                                <p className="text-sm text-gray-500">
                                    Period: {format(new Date(feeRecord.year, feeRecord.month - 1), 'MMMM yyyy')}
                                </p>
                            )}
                        </td>
                        <td className="text-right py-4 text-gray-900 font-medium">
                            ₹{feeRecord.amount.toLocaleString()}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className="pt-4 text-right font-semibold text-gray-900">Total</td>
                        <td className="pt-4 text-right font-bold text-xl text-indigo-600">
                            ₹{feeRecord.amount.toLocaleString()}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Payment Status */}
            <div className="border-t pt-8 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Payment Status</p>
                        <p className={`text-lg font-bold ${feeRecord.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {feeRecord.status}
                        </p>
                        {feeRecord.paidDate && (
                            <p className="text-sm text-gray-500">
                                Paid on {format(new Date(feeRecord.paidDate), 'PPP')}
                            </p>
                        )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <p>Authorized Signature</p>
                        <div className="h-16 w-32 border-b border-gray-300 mt-2 mb-1"></div>
                        <p>Arnav Abacus Academy</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-12 print:hidden">
                <p>Thank you for your business!</p>
            </div>

            {/* Print Button */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <Button onClick={() => window.print()} size="lg" className="shadow-xl">
                    <Printer className="mr-2 h-4 w-4" /> Print Invoice
                </Button>
            </div>
        </div>
    )
}
