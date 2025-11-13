import { describe, expect, it, beforeEach, mock } from 'bun:test'
import { SessionService } from '../../../src/services/session.service'
import { mockSession, mockExpiredSession } from '../../fixtures/sessions'
import { mockUserInDb } from '../../fixtures/users'

// Mock prisma module
const mockPrisma = {
  session: {
    create: mock(),
    findUnique: mock(),
    delete: mock(),
    deleteMany: mock(),
  },
}

mock.module('../../../src/db', () => ({
  prisma: mockPrisma,
}))

describe('SessionService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockPrisma.session.create.mockReset()
    mockPrisma.session.findUnique.mockReset()
    mockPrisma.session.delete.mockReset()
    mockPrisma.session.deleteMany.mockReset()
  })

  describe('createSession', () => {
    it('TC-SESSION-001: should create session successfully', async () => {
      mockPrisma.session.create.mockResolvedValue(mockSession)

      const sessionId = await SessionService.createSession(mockUserInDb.id)

      expect(sessionId).toBe(mockSession.id)
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserInDb.id,
          expiresAt: expect.any(Date),
        },
      })
    })

    it('TC-SESSION-002: should set expiration date in the future', async () => {
      let capturedExpiresAt: Date | null = null

      mockPrisma.session.create.mockImplementation((args: any) => {
        capturedExpiresAt = args.data.expiresAt
        return Promise.resolve(mockSession)
      })

      await SessionService.createSession(mockUserInDb.id)

      expect(capturedExpiresAt).toBeDefined()
      expect(capturedExpiresAt!.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('validateSession', () => {
    it('TC-SESSION-003: should validate active session successfully', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        user: mockUserInDb,
      })

      const result = await SessionService.validateSession(mockSession.id)

      expect(result).toBeDefined()
      expect(result?.session.id).toBe(mockSession.id)
      expect(result?.user.id).toBe(mockUserInDb.id)
      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: mockSession.id },
        include: { user: true },
      })
    })

    it('TC-SESSION-004: should return null for non-existent session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null)

      const result = await SessionService.validateSession('non-existent-id')

      expect(result).toBeNull()
      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        include: { user: true },
      })
    })

    it('TC-SESSION-005: should invalidate and delete expired session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...mockExpiredSession,
        expiresAt: new Date('2023-12-01T00:00:00Z'), // Expired
        user: mockUserInDb,
      })
      mockPrisma.session.delete.mockResolvedValue(mockExpiredSession)

      const result = await SessionService.validateSession(mockExpiredSession.id)

      expect(result).toBeNull()
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: mockExpiredSession.id },
      })
    })

    it('TC-PERF-003: should validate session within acceptable time (<100ms)', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: mockUserInDb,
      })

      const startTime = Date.now()
      await SessionService.validateSession(mockSession.id)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(100)
    })
  })

  describe('deleteSession', () => {
    it('TC-SESSION-006: should delete session successfully', async () => {
      mockPrisma.session.delete.mockResolvedValue(mockSession)

      await SessionService.deleteSession(mockSession.id)

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: mockSession.id },
      })
    })

    it('TC-SESSION-007: should handle deletion of non-existent session gracefully', async () => {
      mockPrisma.session.delete.mockRejectedValue(
        new Error('Record not found')
      )

      // Should not throw error due to .catch() in implementation
      let didThrow = false
      try {
        await SessionService.deleteSession('non-existent-id')
      } catch {
        didThrow = true
      }

      expect(didThrow).toBe(false)
    })
  })

  describe('cleanupExpiredSessions', () => {
    it('TC-SESSION-008: should cleanup expired sessions', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 5 })

      await SessionService.cleanupExpiredSessions()

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      })
    })

    it('TC-SESSION-009: should only delete sessions with expiresAt in the past', async () => {
      let capturedWhereClause: any = null

      mockPrisma.session.deleteMany.mockImplementation((args: any) => {
        capturedWhereClause = args.where
        return Promise.resolve({ count: 3 })
      })

      await SessionService.cleanupExpiredSessions()

      expect(capturedWhereClause).toBeDefined()
      expect(capturedWhereClause.expiresAt.lt.getTime()).toBeLessThanOrEqual(
        Date.now()
      )
    })
  })
})
