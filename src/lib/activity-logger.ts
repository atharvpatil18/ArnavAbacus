import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function logActivity(
    userId: string,
    action: string,
    details: Record<string, any>
) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                details: JSON.stringify(details),
            },
        })
    } catch (error) {
        // We don't want to fail the main request if logging fails, just log the error
        logger.error({ error, userId, action }, 'Failed to create activity log')
    }
}
