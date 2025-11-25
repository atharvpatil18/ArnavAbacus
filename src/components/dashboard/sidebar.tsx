'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    FileText,
    Settings,
    GraduationCap,
    BookOpen,
    DollarSign,
    LogOut,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'

const allRoutes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
        color: 'text-sky-500',
        roles: ['ADMIN', 'TEACHER', 'PARENT']
    },
    {
        label: "Today's Schedule",
        icon: Clock,
        href: '/today',
        color: 'text-amber-500',
        roles: ['TEACHER', 'ADMIN']
    },
    {
        label: 'Students',
        icon: Users,
        href: '/students',
        color: 'text-violet-500',
        roles: ['ADMIN', 'TEACHER', 'PARENT']
    },
    {
        label: 'Batches',
        icon: Calendar,
        href: '/batches',
        color: 'text-pink-700',
        roles: ['ADMIN', 'PARENT']
    },
    {
        label: 'Fees',
        icon: CreditCard,
        href: '/fees',
        color: 'text-emerald-500',
        roles: ['ADMIN', 'PARENT']
    },
    {
        label: 'Exams',
        icon: GraduationCap,
        href: '/exams',
        color: 'text-blue-700',
        roles: ['ADMIN', 'TEACHER', 'PARENT']
    },
    {
        label: 'Homework',
        icon: BookOpen,
        href: '/homework',
        color: 'text-orange-500',
        roles: ['ADMIN', 'TEACHER', 'PARENT']
    },
    {
        label: 'Demos',
        icon: Users,
        href: '/demos',
        color: 'text-purple-600',
        roles: ['ADMIN', 'TEACHER']
    },
    {
        label: 'Finance',
        icon: DollarSign,
        href: '/finance',
        color: 'text-green-600',
        roles: ['ADMIN']
    },
    {
        label: 'Reports',
        icon: FileText,
        href: '/reports',
        color: 'text-green-700',
        roles: ['ADMIN']
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        color: 'text-gray-500',
        roles: ['ADMIN', 'TEACHER', 'PARENT']
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const role = session?.user?.role || 'PARENT'

    // Filter routes based on user role
    const filteredRoutes = allRoutes.filter(route =>
        route.roles.includes(role)
    )

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar border-r-2 border-border text-sidebar-foreground w-64 shrink-0" >
            <div className="px-4 py-2 flex-1">
                <Link href="/" className="flex items-center pl-2 mb-10 group">
                    <div className="relative w-10 h-10 mr-3 transition-transform group-hover:-translate-y-1">
                        <div className="absolute inset-0 bg-primary rounded-lg border-2 border-border shadow-[3px_3px_0px_0px_var(--border)]"></div>
                        <div className="relative w-full h-full flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-2xl font-sans">A</span>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold font-sans tracking-tight text-foreground">
                        Arnav Abacus
                    </h1>
                </Link>
                <div className="space-y-2">
                    {filteredRoutes.map((route) => {
                        const isActive = pathname === route.href
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer transition-all duration-200 rounded-lg border-2',
                                    isActive
                                        ? 'bg-secondary text-secondary-foreground border-border shadow-[3px_3px_0px_0px_var(--border)] -translate-y-[1px]'
                                        : 'text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground hover:border-border'
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn('h-5 w-5 mr-3 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                                    {route.label}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <div className="px-4 py-2 flex items-center justify-between gap-2">
                <Button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    variant="ghost"
                    className="flex-1 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </Button>
                <ThemeToggle />
            </div>
        </div>
    )
}
