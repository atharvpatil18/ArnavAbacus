import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    // Public routes
    const isAuthRoute = nextUrl.pathname.startsWith('/login')
    const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

    // Allow public routes
    if (isAuthRoute || isApiAuthRoute) {
        return NextResponse.next()
    }

    // Require authentication for all other routes
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL('/login', nextUrl))
    }

    // Role-based route protection
    const pathname = nextUrl.pathname

    // Admin-only routes
    const adminOnlyRoutes = [
        '/batches/new',
        '/batches/[id]/edit',
        '/students/new',
        '/students/[id]/edit',
        '/fees/new',
        '/reports',
        '/settings',
    ]

    // Teacher-only routes (Admin can also access)
    const teacherRoutes = [
        '/today',
        '/attendance/mark',
    ]

    // Check if current path matches admin-only routes
    const isAdminRoute = adminOnlyRoutes.some(route => {
        const pattern = route.replace(/\[.*?\]/g, '[^/]+')
        return new RegExp(`^${pattern}$`).test(pathname)
    })

    // Check if current path matches teacher routes
    const isTeacherRoute = teacherRoutes.some(route => {
        const pattern = route.replace(/\[.*?\]/g, '[^/]+')
        return new RegExp(`^${pattern}$`).test(pathname)
    })

    // Redirect non-admin users trying to access admin routes
    if (isAdminRoute && userRole !== 'ADMIN') {
        console.log(`[SECURITY] Blocked ${userRole} from accessing admin route: ${pathname}`)
        return NextResponse.redirect(new URL('/', nextUrl))
    }

    // Redirect non-teacher/admin users trying to access teacher routes
    if (isTeacherRoute && userRole !== 'ADMIN' && userRole !== 'TEACHER') {
        console.log(`[SECURITY] Blocked ${userRole} from accessing teacher route: ${pathname}`)
        return NextResponse.redirect(new URL('/', nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

