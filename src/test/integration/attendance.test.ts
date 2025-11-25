import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/attendance/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    batch: {
      findUnique: vi.fn(),
    }
  },
}))

// Mock Auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '@/auth'

describe('Attendance API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/attendance', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null)
      const { req } = createMocks({ method: 'GET' })
      const res = await GET(req as any)
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/attendance', () => {
    it('should mark attendance for teacher', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'TEACHER', id: 'teacher-id' } })
      const attendanceData = {
        batchId: 'batch-1',
        date: '2025-11-25',
        records: [
          { studentId: 'student-1', status: 'PRESENT' }
        ]
      }

      ;(prisma.attendance.createMany as any).mockResolvedValue({ count: 1 })

      const req = new Request('http://localhost:3000/api/attendance', {
        method: 'POST',
        body: JSON.stringify(attendanceData)
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.count).toBe(1)
    })
  })
})
