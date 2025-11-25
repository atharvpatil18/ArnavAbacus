'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
                    <div className="p-4 bg-destructive/10 rounded-full border-2 border-destructive/20">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
                    <p className="text-muted-foreground max-w-md">
                        We encountered an unexpected error. Please try refreshing the page.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Refresh Page
                        </Button>
                        <Button onClick={() => this.setState({ hasError: false })} variant="ghost">
                            Try Again
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-4 p-4 bg-muted rounded-lg text-xs text-left overflow-auto max-w-lg border border-border">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}
