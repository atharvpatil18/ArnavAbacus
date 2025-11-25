import { prisma } from '@/lib/prisma'
import { requireRole, UserRole } from '@/lib/rbac'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default async function ActivityLogsPage() {
    const session = await auth()
    if (!session) redirect('/login')

    requireRole(session, [UserRole.ADMIN])

    const logs = await prisma.activityLog.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    role: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 50 // Limit to last 50 for now
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Activity Logs</h2>
                <p className="text-muted-foreground">
                    Audit trail of system activities.
                </p>
            </div>

            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        Recent Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-secondary border-b-2 border-border">
                                <TableRow className="hover:bg-secondary">
                                    <TableHead className="text-secondary-foreground font-bold">Time</TableHead>
                                    <TableHead className="text-secondary-foreground font-bold">User</TableHead>
                                    <TableHead className="text-secondary-foreground font-bold">Role</TableHead>
                                    <TableHead className="text-secondary-foreground font-bold">Action</TableHead>
                                    <TableHead className="text-secondary-foreground font-bold">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No activity logs found.</TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-b border-border hover:bg-muted/50 even:bg-muted/30">
                                            <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                                {format(log.createdAt, 'PP pp')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{log.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                                    {log.user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm font-bold text-primary">
                                                {log.action}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate font-mono text-xs text-muted-foreground" title={log.details}>
                                                {log.details}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
