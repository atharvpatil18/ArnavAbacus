import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { studentIds } = await request.json()

        if (!studentIds || !Array.isArray(studentIds)) {
            return NextResponse.json(
                { error: 'Invalid student IDs provided' },
                { status: 400 }
            )
        }

        // Update students to assign them to this batch
        await prisma.student.updateMany({
            where: {
                id: {
                    in: studentIds
                }
            },
            data: {
                batchId: id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error adding students to batch:', error)
        return NextResponse.json(
            { error: 'Failed to add students to batch' },
            { status: 500 }
        )
    }
}
