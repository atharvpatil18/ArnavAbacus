'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Ban, Loader2 } from 'lucide-react'

interface RevokeAccessButtonProps {
    studentId: string
    studentName: string
    isActive: boolean
}

export function RevokeAccessButton({ studentId, studentName, isActive }: RevokeAccessButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleRevoke = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: false })
            })

            if (!res.ok) {
                throw new Error('Failed to revoke access')
            }

            toast({
                title: 'Success',
                description: `Access revoked for ${studentName}.`,
                className: 'bg-green-500 text-white',
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to revoke access. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleReactivate = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: true })
            })

            if (!res.ok) {
                throw new Error('Failed to reactivate')
            }

            toast({
                title: 'Success',
                description: `${studentName} has been reactivated.`,
                className: 'bg-green-500 text-white',
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to reactivate. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    if (!isActive) {
        return (
            <Button
                onClick={handleReactivate}
                disabled={loading}
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reactivate Student
            </Button>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                    <Ban className="mr-2 h-4 w-4" />
                    Revoke Access
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Student Access?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will deactivate {studentName} and remove their access to the portal.
                        They will not appear in active student lists. You can reactivate them later if needed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleRevoke}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Revoke Access
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
