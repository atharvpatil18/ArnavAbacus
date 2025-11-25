import { Sidebar } from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'
import { ErrorBoundary } from '@/components/error-boundary'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title="Dashboard" />
                <main className="flex-1 overflow-y-auto p-8 bg-background">
                    <div className="max-w-7xl mx-auto">
                        <ErrorBoundary>
                            <Breadcrumbs />
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    )
}
