import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { auth } from '@/auth'
import { UserRole, requireRole } from '@/lib/rbac'
import { createUserSchema, validateRequest } from '@/lib/validation'
import { rateLimit, getClientIp, createRateLimitResponse, logAudit } from '@/lib/security'

const limiter = rateLimit({ windowMs: 60000, maxRequests: 30 })

export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Only admins can view all users
        requireRole(session, [UserRole.ADMIN])

        // Rate limiting
        const ip = getClientIp(request)
        if (!limiter(ip)) {
            return createRateLimitResponse()
        }

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const query = searchParams.get('query')

        const where: any = {}

        if (role) {
            where.role = role
        }

        if (query) {
            where.OR = [
                { name: { contains: query } },
                { email: { contains: query } },
            ]
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                // Never return password hashes
            },
        })

        logAudit({
            timestamp: new Date(),
            userId: session.user.id,
            action: 'VIEW_USERS',
            resource: 'users',
            status: 'success',
            ip,
        })

        return NextResponse.json(users)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage === 'Unauthorized' || errorMessage === 'Forbidden') {
            return new NextResponse('Forbidden', { status: 403 })
        }

        console.error('Failed to fetch users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const session = await auth()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RBAC: Only admins can create users
        requireRole(session, [UserRole.ADMIN])

        // Rate limiting
        const ip = getClientIp(request)
        if (!limiter(ip)) {
            return createRateLimitResponse()
        }

        const body = await request.json()

        // Input validation
        const validatedData = validateRequest(createUserSchema, body)
        const { name, email, password, role } = validatedData

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        const hashedPassword = await hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
            },
        })

        const { password: _, ...userWithoutPassword } = user

        logAudit({
            timestamp: new Date(),
            userId: session.user.id,
            action: 'CREATE_USER',
            resource: 'users',
            status: 'success',
            ip,
            details: { createdUserId: user.id, role },
        })

        return NextResponse.json(userWithoutPassword, { status: 201 })
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

        console.error('Failed to create user:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
