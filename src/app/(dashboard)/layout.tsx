import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar'
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
            <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50 no-print">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden md:pl-64">
                <div className="flex items-center p-4 md:hidden">
                    <MobileSidebar />
                    <span className="ml-2 font-bold text-lg">Arnav Abacus</span>
                </div>
                <div className="hidden md:block">
                    <Header title="Dashboard" />
                </div>
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
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
