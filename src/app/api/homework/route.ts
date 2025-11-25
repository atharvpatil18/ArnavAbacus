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

        const homeworks = await prisma.homework.findMany({
            where: whereClause,
            include: {
                student: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(homeworks)
    } catch (error) {
        console.error('[HOMEWORK_GET]', error)
        return NextResponse.json({ error: 'Failed to fetch homework' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || (!isAdmin(session) && !isTeacher(session))) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { studentId, date, accuracy, status, remarks } = body

        const homework = await prisma.homework.create({
            data: {
                studentId,
                date: new Date(date),
                accuracy: accuracy ? parseFloat(accuracy) : null,
                status,
                remarks
            }
        })

        return NextResponse.json(homework)
    } catch (error) {
        console.error('[HOMEWORK_POST]', error)
        return NextResponse.json({ error: 'Failed to create homework' }, { status: 500 })
    }
}
