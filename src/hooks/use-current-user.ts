import { useSession } from 'next-auth/react'

export const useCurrentUser = () => {
    const { data: session } = useSession()
    
    return {
        user: session?.user,
        role: session?.user?.role || 'PARENT', // Default to safest role
        isLoading: !session && session !== null, // Basic loading check
        isAuthenticated: !!session?.user
    }
}
