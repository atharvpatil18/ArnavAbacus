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
    LogOut,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'

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
        roles: ['ADMIN', 'TEACHER']
    },
    {
        label: 'Attendance',
        icon: GraduationCap,
        href: '/attendance',
        color: 'text-orange-700',
        roles: ['ADMIN', 'TEACHER', 'PARENT']
    },
    {
        label: 'Fees',
        icon: CreditCard,
        href: '/fees',
        color: 'text-emerald-500',
        roles: ['ADMIN', 'PARENT']
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
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg animate-pulse opacity-75"></div>
                        <div className="relative bg-white rounded-lg w-full h-full flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-xl">A</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
                        Arnav Abacus
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                                pathname === route.href
                                    ? 'text-white bg-white/10'
                                    : 'text-zinc-400'
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <LogOut className="h-5 w-5 mr-3 text-red-500" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
