import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin, isTeacher, isParent } from '@/lib/rbac'

export async function GET() {
    try {
        // Authentication check
        const session = await auth()
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const userRole = session.user.role
        const userId = session.user.id

        // Role-based data filtering
        let totalStudents: number
        let activeBatches: number
        let pendingFeesData: any
        let attendanceData: any[]

        if (isAdmin(session)) {
            // Admin sees all data
            [totalStudents, activeBatches, pendingFeesData, attendanceData] = await Promise.all([
                prisma.student.count({ where: { active: true } }),
                prisma.batch.count(),
                prisma.feeRecord.aggregate({
                    where: { status: 'PENDING' },
                    _sum: { amount: true }
                }),
                prisma.attendance.findMany({
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30))
                        }
                    },
                    select: { status: true }
                })
            ])
        } else if (isTeacher(session)) {
            // Teacher sees only their batches and students
            [totalStudents, activeBatches, pendingFeesData, attendanceData] = await Promise.all([
                prisma.student.count({
                    where: {
                        active: true,
                        batch: { teacherId: userId }
                    }
                }),
                prisma.batch.count({ where: { teacherId: userId } }),
                prisma.feeRecord.aggregate({
                    where: {
                        status: 'PENDING',
                        student: { batch: { teacherId: userId } }
                    },
                    _sum: { amount: true }
                }),
                prisma.attendance.findMany({
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30))
                        },
                        batch: { teacherId: userId }
                    },
                    select: { status: true }
                })
            ])
        } else if (isParent(session)) {
            // Parent sees only their children's data
            [totalStudents, activeBatches, pendingFeesData, attendanceData] = await Promise.all([
                prisma.student.count({
                    where: {
                        active: true,
                        parentId: userId
                    }
                }),
                prisma.batch.count({
                    where: {
                        students: {
                            some: { parentId: userId }
                        }
                    }
                }),
                prisma.feeRecord.aggregate({
                    where: {
                        status: 'PENDING',
                        student: { parentId: userId }
                    },
                    _sum: { amount: true }
                }),
                prisma.attendance.findMany({
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30))
                        },
                        student: { parentId: userId }
                    },
                    select: { status: true }
                })
            ])
        } else {
            return new NextResponse('Forbidden', { status: 403 })
        }

        // Calculate attendance rate
        const totalAttendance = attendanceData.length
        const presentCount = attendanceData.filter((a: { status: string }) => a.status === 'PRESENT').length
        const attendanceRate = totalAttendance > 0
            ? Math.round((presentCount / totalAttendance) * 100)
            : 0

        return NextResponse.json({
            totalStudents,
            activeBatches,
            pendingFees: pendingFeesData._sum.amount || 0,
            attendanceRate
        })
    } catch (error) {
        console.error('[STATS_GET]', error)
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        )
    }
}
