import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/fees/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    feeRecord: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock Auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '@/auth'

describe('Fees API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/fees', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null)
      const { req } = createMocks({ method: 'GET' })
      const res = await GET(req as any)
      expect(res.status).toBe(401)
    })

    it('should return fees for admin', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'ADMIN', id: 'admin-id' } })
      const mockFees = [{ id: '1', amount: 1000 }]
      ;(prisma.feeRecord.findMany as any).mockResolvedValue(mockFees)

      const { req } = createMocks({ method: 'GET' })
      const res = await GET(req as any)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockFees)
    })
  })

  describe('POST /api/fees', () => {
    it('should create fee record for admin', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'ADMIN', id: 'admin-id' } })
      const newFee = {
        studentId: 'student-1',
        amount: 1000,
        dueDate: '2025-12-01',
        cycle: 'MONTHLY',
        year: 2025,
        month: 12,
        status: 'PENDING'
      }
      
      ;(prisma.feeRecord.create as any).mockResolvedValue({ ...newFee, id: 'fee-1' })

      const req = new Request('http://localhost:3000/api/fees', {
        method: 'POST',
        body: JSON.stringify(newFee)
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.id).toBe('fee-1')
    })
  })
})
