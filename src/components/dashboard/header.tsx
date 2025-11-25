'use client'

import { Bell, User, Settings, LogOut, Menu } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { NotificationBadge } from '@/components/dashboard/notification-badge'

export default function Header({ title }: { title: string }) {
    const { data: session, status } = useSession()

    const userInitials = status === 'loading'
        ? ''
        : session?.user?.name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase() || 'U'

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md transition-all">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBadge />

                <div className="h-6 w-px bg-gray-200"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-gray-900">{session?.user?.name || 'User'}</p>
                                <p className="text-xs leading-none text-gray-500">
                                    {session?.user?.email || ''}
                                </p>
                                <div className="mt-1 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 w-fit">
                                    {session?.user?.role || 'N/A'}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer flex items-center">
                                <User className="mr-2 h-4 w-4 text-gray-500" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer flex items-center">
                                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
