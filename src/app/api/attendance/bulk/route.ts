import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { records } = await request.json()

        if (!records || !Array.isArray(records)) {
            return NextResponse.json(
                { error: 'Invalid records provided' },
                { status: 400 }
            )
        }

        // Use transaction to create multiple records
        await prisma.$transaction(
            records.map((record: any) =>
                prisma.attendance.create({
                    data: {
                        studentId: record.studentId,
                        batchId: record.batchId,
                        date: new Date(record.date),
                        status: record.status
                    }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking bulk attendance:', error)
        return NextResponse.json(
            { error: 'Failed to mark attendance' },
            { status: 500 }
        )
    }
}
