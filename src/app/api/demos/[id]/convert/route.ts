import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAdmin, isTeacher } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session || !session.user || (!isAdmin(session) && !isTeacher(session))) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = await params

        const demoStudent = await prisma.demoStudent.findUnique({
            where: { id }
        })

        if (!demoStudent) {
            return new NextResponse('Student not found', { status: 404 })
        }

        if (demoStudent.converted) {
            return new NextResponse('Already converted', { status: 400 })
        }

        // Create Parent User
        const parentEmail = `parent.${demoStudent.name.toLowerCase().replace(/\s+/g, '')}@arnavabacus.com`
        const hashedPassword = await bcrypt.hash('password123', 10)
        
        let parent = await prisma.user.findUnique({ where: { email: parentEmail } })
        if (!parent) {
            parent = await prisma.user.create({
                data: {
                    name: `${demoStudent.name}'s Parent`,
                    email: parentEmail,
                    password: hashedPassword,
                    role: 'PARENT'
                }
            })
        }

        // Create Active Student
        const student = await prisma.student.create({
            data: {
                name: demoStudent.name,
                dob: new Date('2015-01-01'), // Placeholder
                gender: 'OTHER',
                joiningDate: new Date(),
                active: true,
                parentId: parent.id,
                contactNumber: demoStudent.contact
            }
        })

        // Update Demo Student
        await prisma.demoStudent.update({
            where: { id },
            data: {
                converted: true,
                studentId: student.id
            }
        })

        return NextResponse.json(student)
    } catch (error) {
        console.error('[DEMO_CONVERT]', error)
        return NextResponse.json({ error: 'Failed to convert student' }, { status: 500 })
    }
}
