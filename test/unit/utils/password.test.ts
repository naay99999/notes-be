import { describe, expect, it } from 'bun:test'
import { hashPassword, verifyPassword } from '../../../src/utils/password'

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('TC-SEC-001: should hash password successfully', async () => {
      const password = 'TestPass123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash).toStartWith('$argon2')
    })

    it('TC-SEC-002: should generate different hashes for same password', async () => {
      const password = 'TestPass123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('TC-SEC-003: should handle special characters in password', async () => {
      const password = 'P@ssw0rd!#$%^&*()'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).toStartWith('$argon2')
    })

    it('TC-EDGE-001: should handle Unicode characters in password', async () => {
      const password = 'รหัสผ่าน中文日本語'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).toStartWith('$argon2')
    })
  })

  describe('verifyPassword', () => {
    it('TC-SEC-004: should verify correct password successfully', async () => {
      const password = 'TestPass123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it('TC-SEC-005: should reject incorrect password', async () => {
      const password = 'TestPass123'
      const wrongPassword = 'WrongPass456'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)

      expect(isValid).toBe(false)
    })

    it('TC-SEC-006: should handle case-sensitive verification', async () => {
      const password = 'TestPass123'
      const wrongCasePassword = 'testpass123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongCasePassword, hash)

      expect(isValid).toBe(false)
    })

    it('TC-EDGE-002: should reject empty string password', async () => {
      const password = ''

      expect(async () => {
        await hashPassword(password)
      }).toThrow()
    })

    it('TC-PERF-002: should hash password within acceptable time (<500ms)', async () => {
      const password = 'TestPass123'
      const startTime = Date.now()
      await hashPassword(password)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(500)
    })
  })
})
