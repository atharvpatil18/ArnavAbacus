import { logger } from '@/lib/logger'

export async function sendEmail(to: string, subject: string, body: string) {
    // Mock implementation: Log to console/logger
    logger.info({ to, subject }, 'MOCK EMAIL SENT')
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${body}`)
}

export async function sendSMS(to: string, message: string) {
    // Mock implementation: Log to console/logger
    logger.info({ to }, 'MOCK SMS SENT')
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`)
}
