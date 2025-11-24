import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { hash } from 'bcryptjs'
import { UserRole, requireRole } from '@/lib/rbac'
import { createStudentSchema, validateRequest, sanitizeEmail, sanitizeString } from '@/lib/validation'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('query')
        const level = searchParams.get('level')
        const batchId = searchParams.get('batchId')
        const active = searchParams.get('active')
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        const where: any = {}

        if (query) {
            where.OR = [
                { name: { contains: query } },
                { email: { contains: query } },
                { parent: { name: { contains: query } } },
            ]
        }

        if (level) {
            where.level = level
        }

        if (batchId) {
            where.batchId = batchId
        }

        if (active !== null && active !== undefined) {
            where.active = active === 'true'
        }

        // RBAC: Parents can only see their own children
        if (session.user.role === 'PARENT') {
            where.parentId = session.user.id
        }

        // Dynamic sorting
        const orderBy: any = {}
        if (sortBy === 'name') {
            orderBy.name = sortOrder
        } else if (sortBy === 'level') {
            orderBy.level = sortOrder
        } else if (sortBy === 'dob') {
            orderBy.dob = sortOrder
        } else if (sortBy === 'joiningDate') {
            orderBy.joiningDate = sortOrder
        } else {
            orderBy.createdAt = sortOrder
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                parent: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                batch: {
                    select: {
                        name: true,
                        timeSlot: true,
                        days: true,
                    }
                }
            },
            orderBy,
        })

        return NextResponse.json(students)
    } catch (error) {
        console.error('[STUDENTS_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Only admins can create students
        requireRole(session, [UserRole.ADMIN])

        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(createStudentSchema, body)
        const {
            name,
            dob,
            gender,
            contactNumber,
            email,
            address,
            level,
            parentName,
            parentEmail,
        } = validatedData

        // 1. Create or Find Parent User
        // Normalize email to lowercase
        const normalizedParentEmail = sanitizeEmail(parentEmail)

        let parent = await prisma.user.findUnique({
            where: { email: normalizedParentEmail },
        })

        let generatedPassword = null
        let isNewUser = false

        if (!parent) {
            // Use email as initial password
            generatedPassword = normalizedParentEmail
            const hashedPassword = await hash(generatedPassword, 10)

            parent = await prisma.user.create({
                data: {
                    name: sanitizeString(parentName),
                    email: normalizedParentEmail,
                    role: 'PARENT',
                    password: hashedPassword,
                },
            })
            isNewUser = true
        }

        // 2. Create Student
        const student = await prisma.student.create({
            data: {
                name: sanitizeString(name),
                dob: new Date(dob),
                gender,
                contactNumber: sanitizeString(contactNumber),
                email: email ? sanitizeEmail(email) : null,
                address: sanitizeString(address),
                level: sanitizeString(level),
                parentId: parent.id,
            },
        })

        return NextResponse.json({
            student,
            credentials: isNewUser ? {
                email: parent.email,
                password: generatedPassword
            } : null
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        if (errorMessage.includes('Validation error')) {
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            )
        }

        console.error('[STUDENTS_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
