import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const body = await request.json()
        const { status, paymentDate, remarks } = body

        const feeRecord = await prisma.feeRecord.update({
            where: { id },
            data: {
                status,
                paidDate: paymentDate ? new Date(paymentDate) : undefined,
                remarks,
            },
        })

        return NextResponse.json(feeRecord)
    } catch (error) {
        console.error('Failed to update fee record:', error)
        return NextResponse.json(
            { error: 'Failed to update fee record' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        await prisma.feeRecord.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Fee record deleted successfully' })
    } catch (error) {
        console.error('Failed to delete fee record:', error)
        return NextResponse.json(
            { error: 'Failed to delete fee record' },
            { status: 500 }
        )
    }
}
