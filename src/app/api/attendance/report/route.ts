import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const batchId = searchParams.get('batchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    try {
        const where: any = {}

        if (studentId) {
            where.studentId = studentId
        }

        if (batchId) {
            where.batchId = batchId
        }

        if (startDate && endDate) {
            where.date = {
                gte: startOfDay(parseISO(startDate)),
                lte: endOfDay(parseISO(endDate)),
            }
        }

        const attendanceRecords = await prisma.attendance.findMany({
            where,
            include: {
                student: {
                    select: {
                        name: true,
                    },
                },
                batch: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        })

        // Calculate stats
        const stats = {
            total: attendanceRecords.length,
            present: attendanceRecords.filter((r) => r.status === 'PRESENT').length,
            absent: attendanceRecords.filter((r) => r.status === 'ABSENT').length,
            late: attendanceRecords.filter((r) => r.status === 'LATE').length,
        }

        return NextResponse.json({
            stats,
            records: attendanceRecords,
        })
    } catch (error) {
        console.error('Failed to fetch attendance report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch attendance report' },
            { status: 500 }
        )
    }
}
