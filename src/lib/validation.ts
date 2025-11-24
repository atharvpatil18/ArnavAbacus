import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['ADMIN', 'TEACHER', 'PARENT']),
})

export const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['ADMIN', 'TEACHER', 'PARENT']).optional(),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Student validation schemas
export const createStudentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    dob: z.string().or(z.date()),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    level: z.string().min(1, 'Level is required'),
    parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
    parentEmail: z.string().email('Invalid parent email address'),
})

export const updateStudentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    dob: z.string().or(z.date()).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits').optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    level: z.string().optional(),
    active: z.boolean().optional(),
    batchId: z.string().optional().nullable(),
})

// Batch validation schemas
export const createBatchSchema = z.object({
    name: z.string().min(2, 'Batch name must be at least 2 characters'),
    level: z.string().min(1, 'Level is required'),
    days: z.string().or(z.array(z.string())),
    timeSlot: z.string().min(1, 'Time slot is required'),
    teacherId: z.string().min(1, 'Teacher is required'),
})

export const updateBatchSchema = z.object({
    name: z.string().min(2, 'Batch name must be at least 2 characters').optional(),
    level: z.string().optional(),
    days: z.string().or(z.array(z.string())).optional(),
    timeSlot: z.string().optional(),
    teacherId: z.string().optional(),
})

// Fee validation schemas
export const createFeeSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    amount: z.number().positive('Amount must be positive').or(z.string()),
    dueDate: z.string().or(z.date()).optional(),
    cycle: z.string().optional(),
    year: z.number().or(z.string()).optional(),
    month: z.number().min(1).max(12).or(z.string()).optional(),
    remarks: z.string().optional(),
    type: z.string().optional(),
    date: z.string().or(z.date()).optional(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
})

export const updateFeeSchema = z.object({
    amount: z.number().positive('Amount must be positive').or(z.string()).optional(),
    dueDate: z.string().or(z.date()).optional(),
    paidDate: z.string().or(z.date()).optional().nullable(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
    remarks: z.string().optional(),
})

// Attendance validation schemas
export const markAttendanceSchema = z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    date: z.string().or(z.date()),
    records: z.array(z.object({
        studentId: z.string().min(1, 'Student ID is required'),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    })),
})

export const bulkAttendanceSchema = z.object({
    records: z.array(z.object({
        batchId: z.string().min(1, 'Batch ID is required'),
        studentId: z.string().min(1, 'Student ID is required'),
        date: z.string().or(z.date()),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    })),
})

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ')
            throw new Error(`Validation error: ${messages}`)
        }
        throw error
    }
}

// Sanitization functions
export function sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '')
}

export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj }
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeString(sanitized[key]) as any
        }
    }
    return sanitized
}
