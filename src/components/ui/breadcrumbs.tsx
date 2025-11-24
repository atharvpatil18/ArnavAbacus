'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

export function Breadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    if (paths.length === 0) return null

    return (
        <nav className="flex items-center text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
            </Link>
            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`
                const isLast = index === paths.length - 1
                const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

                return (
                    <Fragment key={path}>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-foreground transition-colors">
                                {label}
                            </Link>
                        )}
                    </Fragment>
                )
            })}
        </nav>
    )
}
