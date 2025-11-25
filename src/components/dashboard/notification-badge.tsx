'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import Link from 'next/link'

export function NotificationBadge() {
    const { data: session } = useSession()
    const [count, setCount] = useState(0)
    const [notifications, setNotifications] = useState<{ id: string, title: string, message: string, href: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!session?.user) return

            try {
                // Mock logic to derive notifications from existing APIs
                // In a real app, this would be a dedicated /api/notifications endpoint
                let newNotifications: typeof notifications = []

                if (session.user.role === 'ADMIN') {
                    const res = await fetch('/api/fees')
                    if (res.ok) {
                        const fees = await res.json()
                        const pending = fees.filter((f: any) => f.status === 'PENDING')
                        if (pending.length > 0) {
                            newNotifications.push({
                                id: 'fees',
                                title: 'Pending Fees',
                                message: `${pending.length} payments are pending approval.`,
                                href: '/fees'
                            })
                        }
                    }
                } else if (session.user.role === 'TEACHER') {
                    const res = await fetch('/api/batches')
                    if (res.ok) {
                        const batches = await res.json()
                        // Mock: assume all batches returned are "today's" for now as per previous logic
                        if (batches.length > 0) {
                            newNotifications.push({
                                id: 'classes',
                                title: 'Today\'s Schedule',
                                message: `You have ${batches.length} classes scheduled today.`,
                                href: '/today'
                            })
                        }
                    }
                } else if (session.user.role === 'PARENT') {
                    // For parent, we'd check their specific fees
                    // This requires an endpoint that filters by parent, which /api/fees might not do fully yet without params
                    // Skipping complex fetch for now to avoid errors, just showing a welcome message
                    newNotifications.push({
                        id: 'welcome',
                        title: 'Welcome',
                        message: 'Welcome to the new parent portal!',
                        href: '/dashboard'
                    })
                }

                setNotifications(newNotifications)
                setCount(newNotifications.length)
            } catch (error) {
                console.error('Failed to fetch notifications', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [session])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                    <Bell className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border bg-muted/50">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        You have {count} unread messages.
                    </p>
                </div>
                <div className="h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No new notifications.</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.href}
                                    className="flex flex-col gap-1 p-4 hover:bg-muted transition-colors"
                                >
                                    <span className="text-sm font-medium text-foreground">{notification.title}</span>
                                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
