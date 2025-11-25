'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Breadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    if (paths.length === 0) return null

    return (
        <nav className="flex items-center text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link
                href="/"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`
                const isLast = index === paths.length - 1
                const label = path.charAt(0).toUpperCase() + path.slice(1)

                return (
                    <div key={path} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{label}</span>
                        ) : (
                                <Link
                                    href={href}
                                    className="hover:text-foreground transition-colors"
                                >
                                {label}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
