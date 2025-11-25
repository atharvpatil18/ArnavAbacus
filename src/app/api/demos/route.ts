import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin, isTeacher } from '@/lib/rbac'
import { logger } from '@/lib/logger'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const userId = session.user.id
        let whereClause: any = {}

        if (isTeacher(session)) {
            whereClause = { teacherId: userId }
        }

        // Explicitly log for debugging
        logger.info({ userId, role: session.user.role, whereClause }, 'Fetching demos with filter')

        const demos = await prisma.demoClass.findMany({
            where: whereClause,
            include: {
                teacher: { select: { name: true } },
                students: true
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(demos)
    } catch (error) {
        console.error('[DEMOS_GET]', error)
        return NextResponse.json({ error: 'Failed to fetch demos' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || (!isAdmin(session) && !isTeacher(session))) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { date, timeSlot, studentName, parentName, contact } = body

        // Create Demo Class if not exists for this slot? Or just create new one.
        // For simplicity, creating a new one or finding existing one on same date/time/teacher
        
        let demoClass = await prisma.demoClass.findFirst({
            where: {
                date: new Date(date),
                timeSlot,
                teacherId: session.user.id
            }
        })

        if (!demoClass) {
            demoClass = await prisma.demoClass.create({
                data: {
                    date: new Date(date),
                    timeSlot,
                    teacherId: session.user.id,
                    status: 'SCHEDULED'
                }
            })
        }

        // Add Student
        if (studentName) {
            await prisma.demoStudent.create({
                data: {
                    name: studentName,
                    parentName,
                    contact,
                    demoClassId: demoClass.id
                }
            })
        }

        return NextResponse.json(demoClass)
    } catch (error) {
        console.error('[DEMOS_POST]', error)
        return NextResponse.json({ error: 'Failed to schedule demo' }, { status: 500 })
    }
}
