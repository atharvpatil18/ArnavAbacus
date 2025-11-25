import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/attendance/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      upsert: vi.fn(),
    },
    batch: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback),
  },
}))

// Mock Auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

describe('Attendance API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/attendance', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null)
      const req = new Request('http://localhost:3000/api/attendance')
      const res = await GET(req)
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

        ; (prisma.batch.findUnique as any).mockResolvedValue({ teacherId: 'teacher-id' })
        ; (prisma.attendance.upsert as any).mockResolvedValue({ id: 'att-1' })
        ; (prisma.$transaction as any).mockImplementation(async (promises: any[]) => {
          return Promise.all(promises)
        })

      const req = new Request('http://localhost:3000/api/attendance', {
        method: 'POST',
        body: JSON.stringify(attendanceData)
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toHaveLength(1)
    })
  })
})
