import { Session } from 'next-auth'

// Define user roles
export enum UserRole {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    PARENT = 'PARENT',
}

// Define permissions for each resource
export enum Permission {
    // Student permissions
    VIEW_STUDENTS = 'VIEW_STUDENTS',
    VIEW_OWN_STUDENTS = 'VIEW_OWN_STUDENTS',
    CREATE_STUDENTS = 'CREATE_STUDENTS',
    EDIT_STUDENTS = 'EDIT_STUDENTS',
    DELETE_STUDENTS = 'DELETE_STUDENTS',

    // Batch permissions
    VIEW_BATCHES = 'VIEW_BATCHES',
    VIEW_OWN_BATCHES = 'VIEW_OWN_BATCHES',
    CREATE_BATCHES = 'CREATE_BATCHES',
    EDIT_BATCHES = 'EDIT_BATCHES',
    DELETE_BATCHES = 'DELETE_BATCHES',

    // Attendance permissions
    VIEW_ATTENDANCE = 'VIEW_ATTENDANCE',
    VIEW_OWN_ATTENDANCE = 'VIEW_OWN_ATTENDANCE',
    MARK_ATTENDANCE = 'MARK_ATTENDANCE',

    // Fee permissions
    VIEW_FEES = 'VIEW_FEES',
    VIEW_OWN_FEES = 'VIEW_OWN_FEES',
    CREATE_FEES = 'CREATE_FEES',
    EDIT_FEES = 'EDIT_FEES',
    DELETE_FEES = 'DELETE_FEES',

    // User permissions
    VIEW_USERS = 'VIEW_USERS',
    CREATE_USERS = 'CREATE_USERS',
    EDIT_USERS = 'EDIT_USERS',
    DELETE_USERS = 'DELETE_USERS',

    // Report permissions
    VIEW_REPORTS = 'VIEW_REPORTS',
    VIEW_ALL_STATS = 'VIEW_ALL_STATS',

    // Settings permissions
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

// Role-Permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
        // Admin has all permissions
        Permission.VIEW_STUDENTS,
        Permission.CREATE_STUDENTS,
        Permission.EDIT_STUDENTS,
        Permission.DELETE_STUDENTS,
        Permission.VIEW_BATCHES,
        Permission.CREATE_BATCHES,
        Permission.EDIT_BATCHES,
        Permission.DELETE_BATCHES,
        Permission.VIEW_ATTENDANCE,
        Permission.MARK_ATTENDANCE,
        Permission.VIEW_FEES,
        Permission.CREATE_FEES,
        Permission.EDIT_FEES,
        Permission.DELETE_FEES,
        Permission.VIEW_USERS,
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.DELETE_USERS,
        Permission.VIEW_REPORTS,
        Permission.VIEW_ALL_STATS,
        Permission.MANAGE_SETTINGS,
    ],
    [UserRole.TEACHER]: [
        // Teacher can view students and batches, mark attendance
        Permission.VIEW_STUDENTS,
        Permission.VIEW_OWN_BATCHES,
        Permission.VIEW_ATTENDANCE,
        Permission.MARK_ATTENDANCE,
        Permission.VIEW_FEES,
    ],
    [UserRole.PARENT]: [
        // Parent can only view their own children's data
        Permission.VIEW_OWN_STUDENTS,
        Permission.VIEW_OWN_ATTENDANCE,
        Permission.VIEW_OWN_FEES,
    ],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
    if (!role || !(role in rolePermissions)) {
        return false
    }
    return rolePermissions[role as UserRole].includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(session: Session | null): Session {
    if (!session || !session.user) {
        throw new Error('Unauthorized')
    }
    return session
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export function requireRole(session: Session | null, allowedRoles: UserRole[]): Session {
    const authedSession = requireAuth(session)
    const userRole = authedSession.user.role as UserRole

    if (!allowedRoles.includes(userRole)) {
        throw new Error('Forbidden')
    }
    return authedSession
}

/**
 * Require specific permission - throws error if user doesn't have the permission
 */
export function requirePermission(session: Session | null, permission: Permission): Session {
    const authedSession = requireAuth(session)
    const userRole = authedSession.user.role

    if (!hasPermission(userRole, permission)) {
        throw new Error('Forbidden')
    }
    return authedSession
}

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
    return session?.user?.role === UserRole.ADMIN
}

/**
 * Check if user is teacher
 */
export function isTeacher(session: Session | null): boolean {
    return session?.user?.role === UserRole.TEACHER
}

/**
 * Check if user is parent
 */
export function isParent(session: Session | null): boolean {
    return session?.user?.role === UserRole.PARENT
}

/**
 * Get user role from session
 */
export function getUserRole(session: Session | null): UserRole | null {
    if (!session?.user?.role) return null
    return session.user.role as UserRole
}

/**
 * Check if user owns a resource (for parent checking if student is their child)
 */
export function checkOwnership(session: Session | null, ownerId: string): boolean {
    if (!session?.user?.id) return false
    if (isAdmin(session)) return true // Admin can access everything
    return session.user.id === ownerId
}
