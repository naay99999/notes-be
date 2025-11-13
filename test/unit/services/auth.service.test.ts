import { describe, expect, it, beforeEach, mock } from 'bun:test'
import { AuthService } from '../../../src/services/auth.service'
import { mockUserInDb, testUsers } from '../../fixtures/users'
import { hashPassword } from '../../../src/utils/password'

// Mock prisma module
const mockPrisma = {
  user: {
    findUnique: mock(),
    create: mock(),
  },
}

mock.module('../../../src/db', () => ({
  prisma: mockPrisma,
}))

describe('AuthService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockPrisma.user.findUnique.mockReset()
    mockPrisma.user.create.mockReset()
  })

  describe('register', () => {
    it('TC-AUTH-001: should register user successfully', async () => {
      // Setup mocks
      mockPrisma.user.findUnique.mockResolvedValue(null) // No existing user
      mockPrisma.user.create.mockResolvedValue({
        id: mockUserInDb.id,
        email: testUsers.validUser.email,
        name: testUsers.validUser.name,
        createdAt: mockUserInDb.createdAt,
      })

      const result = await AuthService.register(
        testUsers.validUser.email,
        testUsers.validUser.password,
        testUsers.validUser.name
      )

      expect(result).toMatchObject({
        id: mockUserInDb.id,
        email: testUsers.validUser.email,
        name: testUsers.validUser.name,
      })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser.email },
      })
      expect(mockPrisma.user.create).toHaveBeenCalled()
    })

    it('TC-AUTH-002: should reject duplicate email registration', async () => {
      // Setup mock - user already exists
      mockPrisma.user.findUnique.mockResolvedValue(mockUserInDb)

      await expect(
        AuthService.register(
          testUsers.validUser.email,
          testUsers.validUser.password,
          testUsers.validUser.name
        )
      ).rejects.toThrow('User already exists')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser.email },
      })
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('TC-AUTH-003: should register user without name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: mockUserInDb.id,
        email: testUsers.validUser.email,
        name: null,
        createdAt: mockUserInDb.createdAt,
      })

      const result = await AuthService.register(
        testUsers.validUser.email,
        testUsers.validUser.password
      )

      expect(result.email).toBe(testUsers.validUser.email)
      expect(mockPrisma.user.create).toHaveBeenCalled()
    })

    it('TC-AUTH-004: should not return password in registration response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: mockUserInDb.id,
        email: testUsers.validUser.email,
        name: testUsers.validUser.name,
        createdAt: mockUserInDb.createdAt,
      })

      const result = await AuthService.register(
        testUsers.validUser.email,
        testUsers.validUser.password,
        testUsers.validUser.name
      )

      expect(result).not.toHaveProperty('password')
    })

    it('TC-EDGE-003: should handle Unicode in name during registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: mockUserInDb.id,
        email: testUsers.unicodeUser.email,
        name: testUsers.unicodeUser.name,
        createdAt: mockUserInDb.createdAt,
      })

      const result = await AuthService.register(
        testUsers.unicodeUser.email,
        testUsers.unicodeUser.password,
        testUsers.unicodeUser.name
      )

      expect(result.name).toBe(testUsers.unicodeUser.name)
    })
  })

  describe('login', () => {
    it('TC-AUTH-005: should login successfully with valid credentials', async () => {
      const hashedPassword = await hashPassword(testUsers.validUser.password)

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUserInDb,
        password: hashedPassword,
      })

      const result = await AuthService.login(
        testUsers.validUser.email,
        testUsers.validUser.password
      )

      expect(result).toMatchObject({
        id: mockUserInDb.id,
        email: mockUserInDb.email,
        name: mockUserInDb.name,
      })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testUsers.validUser.email },
      })
    })

    it('TC-AUTH-006: should reject login with non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        AuthService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      })
    })

    it('TC-AUTH-007: should reject login with wrong password', async () => {
      const hashedPassword = await hashPassword(testUsers.validUser.password)

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUserInDb,
        password: hashedPassword,
      })

      await expect(
        AuthService.login(testUsers.validUser.email, 'wrongpassword')
      ).rejects.toThrow('Invalid credentials')
    })

    it('TC-AUTH-008: should not return password in login response', async () => {
      const hashedPassword = await hashPassword(testUsers.validUser.password)

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUserInDb,
        password: hashedPassword,
      })

      const result = await AuthService.login(
        testUsers.validUser.email,
        testUsers.validUser.password
      )

      expect(result).not.toHaveProperty('password')
    })

    it('TC-AUTH-009: should handle case-sensitive email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        AuthService.login('TEST@EXAMPLE.COM', testUsers.validUser.password)
      ).rejects.toThrow('Invalid credentials')
    })

    it('TC-SEC-007: should not reveal whether email exists or password is wrong', async () => {
      // Test non-existent email
      mockPrisma.user.findUnique.mockResolvedValue(null)

      try {
        await AuthService.login('nonexistent@example.com', 'password')
      } catch (error1) {
        // Test wrong password
        const hashedPassword = await hashPassword(testUsers.validUser.password)
        mockPrisma.user.findUnique.mockResolvedValue({
          ...mockUserInDb,
          password: hashedPassword,
        })

        try {
          await AuthService.login(testUsers.validUser.email, 'wrongpassword')
        } catch (error2) {
          // Both should have the same error message
          expect((error1 as Error).message).toBe('Invalid credentials')
          expect((error2 as Error).message).toBe('Invalid credentials')
          expect((error1 as Error).message).toBe((error2 as Error).message)
          return
        }
      }

      throw new Error('Expected errors to be thrown')
    })
  })
})
