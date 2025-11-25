'use client'

import { useCurrentUser } from '@/hooks/use-current-user'

interface RoleGateProps {
    children: React.ReactNode
    allowedRoles: ('ADMIN' | 'TEACHER' | 'PARENT')[]
}

export const RoleGate = ({ children, allowedRoles }: RoleGateProps) => {
    const { role } = useCurrentUser()

    if (!allowedRoles.includes(role as any)) {
        return null
    }

    return <>{children}</>
}
