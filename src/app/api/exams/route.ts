import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin, isTeacher, isParent } from '@/lib/rbac'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const userId = session.user.id
        let whereClause: any = {}

        if (isTeacher(session)) {
            whereClause = {
                student: {
                    batch: { teacherId: userId }
                }
            }
        } else if (isParent(session)) {
            whereClause = {
                student: { parentId: userId }
            }
        }

        const exams = await prisma.exam.findMany({
            where: whereClause,
            include: {
                student: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(exams)
    } catch (error) {
        console.error('[EXAMS_GET]', error)
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || (!isAdmin(session) && !isTeacher(session))) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { studentId, level, marks, totalMarks, date, trophyNomination } = body

        const exam = await prisma.exam.create({
            data: {
                studentId,
                level,
                marks: parseFloat(marks),
                totalMarks: parseFloat(totalMarks || '100'),
                date: new Date(date),
                trophyNomination: trophyNomination || false,
                status: 'COMPLETED'
            }
        })

        return NextResponse.json(exam)
    } catch (error) {
        console.error('[EXAMS_POST]', error)
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
    }
}
