import { describe, expect, it, beforeEach, mock } from 'bun:test'
import { createTestApp } from '../../helpers/app'
import { createJsonRequest } from '../../helpers/request'
import { getSessionIdFromCookie, verifyCookieAttributes } from '../../helpers/cookies'
import { testUsers, mockUserInDb } from '../../fixtures/users'

// Mock prisma module
const mockPrisma = {
  user: {
    findUnique: mock(),
    create: mock(),
  },
  session: {
    create: mock(),
    findUnique: mock(),
    delete: mock(),
  },
}

mock.module('../../../src/db', () => ({
  prisma: mockPrisma,
}))

describe('POST /auth/register', () => {
  const app = createTestApp()

  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset()
    mockPrisma.user.create.mockReset()
    mockPrisma.session.create.mockReset()
  })

  it('TC-AUTH-001: should register user successfully with 201 status', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: mockUserInDb.id,
      email: testUsers.validUser.email,
      name: testUsers.validUser.name,
      createdAt: mockUserInDb.createdAt,
    })
    mockPrisma.session.create.mockResolvedValue({
      id: 'session-123',
      userId: mockUserInDb.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    })

    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
        name: testUsers.validUser.name,
      })
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.user.email).toBe(testUsers.validUser.email)
    expect(body.user.name).toBe(testUsers.validUser.name)
    expect(body.user.password).toBeUndefined()

    const setCookie = response.headers.get('set-cookie')
    expect(setCookie).toBeDefined()
    const cookieAttrs = verifyCookieAttributes(setCookie)
    expect(cookieAttrs?.hasHttpOnly).toBe(true)
    expect(cookieAttrs?.hasSameSite).toBe(true)
  })

  it('TC-AUTH-002: should reject duplicate email with error status', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUserInDb)

    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
        name: testUsers.validUser.name,
      })
    )

    // Should return error status (409 or 500)
    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it('TC-VAL-001: should reject invalid email format', async () => {
    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: 'invalid-email',
        password: testUsers.validUser.password,
        name: testUsers.validUser.name,
      })
    )

    // Should return validation error status
    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it('TC-VAL-002: should reject short password (<8 chars)', async () => {
    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: testUsers.validUser.email,
        password: '123',
        name: testUsers.validUser.name,
      })
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it('TC-VAL-004: should reject missing required fields', async () => {
    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: testUsers.validUser.email,
        // Missing password
      })
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it('TC-AUTH-003: should register user without name (optional field)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: mockUserInDb.id,
      email: testUsers.validUser.email,
      name: null,
      createdAt: mockUserInDb.createdAt,
    })
    mockPrisma.session.create.mockResolvedValue({
      id: 'session-123',
      userId: mockUserInDb.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    })

    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      })
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.user.email).toBe(testUsers.validUser.email)
  })

  it('TC-EDGE-003: should handle Unicode characters in name', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: mockUserInDb.id,
      email: testUsers.unicodeUser.email,
      name: testUsers.unicodeUser.name,
      createdAt: mockUserInDb.createdAt,
    })
    mockPrisma.session.create.mockResolvedValue({
      id: 'session-123',
      userId: mockUserInDb.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    })

    const response = await app.handle(
      createJsonRequest('http://localhost/auth/register', 'POST', {
        email: testUsers.unicodeUser.email,
        password: testUsers.unicodeUser.password,
        name: testUsers.unicodeUser.name,
      })
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.user.name).toBe(testUsers.unicodeUser.name)
  })
})
