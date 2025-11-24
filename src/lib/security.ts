import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
interface RateLimitConfig {
    windowMs: number // Time window in milliseconds
    maxRequests: number // Maximum requests per window
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }) {
    return (identifier: string): boolean => {
        const now = Date.now()
        const record = rateLimitStore.get(identifier)

        if (!record || now > record.resetTime) {
            // Create new record or reset expired one
            rateLimitStore.set(identifier, {
                count: 1,
                resetTime: now + config.windowMs,
            })
            return true
        }

        if (record.count >= config.maxRequests) {
            return false // Rate limit exceeded
        }

        record.count++
        return true
    }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return ip
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(): NextResponse {
    return new NextResponse('Too many requests', {
        status: 429,
        headers: {
            'Retry-After': '60',
        },
    })
}

/**
 * Security headers
 */
export function getSecurityHeaders(): Record<string, string> {
    return {
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',
        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',
        // Enable XSS protection
        'X-XSS-Protection': '1; mode=block',
        // Referrer policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Content Security Policy
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    }
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    return response
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimitStore() {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

/**
 * Audit log entry
 */
export interface AuditLog {
    timestamp: Date
    userId?: string
    action: string
    resource: string
    status: 'success' | 'failure'
    ip?: string
    details?: any
}

/**
 * Log audit event (implement proper logging in production)
 */
export function logAudit(log: AuditLog) {
    // In production, send to logging service
    console.log('[AUDIT]', JSON.stringify(log))
}

/**
 * Create error response with security in mind (don't leak sensitive info)
 */
export function createErrorResponse(
    error: Error,
    status: number = 500,
    production: boolean = process.env.NODE_ENV === 'production'
): NextResponse {
    const message = production
        ? 'An error occurred'
        : error.message

    return NextResponse.json(
        { error: message },
        { status }
    )
}

/**
 * Password strength validator
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Failed login attempt tracking
 */
const loginAttempts = new Map<string, { count: number; lockUntil?: number }>()

export const LOGIN_CONFIG = {
    MAX_ATTEMPTS: 5,
    LOCK_DURATION: 15 * 60 * 1000, // 15 minutes
}

/**
 * Check if account is locked
 */
export function isAccountLocked(identifier: string): boolean {
    const record = loginAttempts.get(identifier)
    if (!record?.lockUntil) return false

    if (Date.now() < record.lockUntil) {
        return true
    }

    // Lock expired, reset
    loginAttempts.delete(identifier)
    return false
}

/**
 * Record failed login attempt
 */
export function recordFailedLogin(identifier: string): { locked: boolean; attemptsLeft: number } {
    const record = loginAttempts.get(identifier) || { count: 0 }
    record.count++

    if (record.count >= LOGIN_CONFIG.MAX_ATTEMPTS) {
        record.lockUntil = Date.now() + LOGIN_CONFIG.LOCK_DURATION
        loginAttempts.set(identifier, record)
        return { locked: true, attemptsLeft: 0 }
    }

    loginAttempts.set(identifier, record)
    return {
        locked: false,
        attemptsLeft: LOGIN_CONFIG.MAX_ATTEMPTS - record.count,
    }
}

/**
 * Reset login attempts on successful login
 */
export function resetLoginAttempts(identifier: string) {
    loginAttempts.delete(identifier)
}
