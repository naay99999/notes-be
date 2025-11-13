import { beforeEach } from 'bun:test'
import { resetMockPrisma } from './helpers/mock-prisma'

// Reset mock Prisma before each test
beforeEach(() => {
  resetMockPrisma()
})

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.SESSION_SECRET = 'test-secret-key-minimum-32-chars-long-for-testing'
process.env.SESSION_MAX_AGE = '604800000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/notes_test'
process.env.FRONTEND_URL = 'http://localhost:5173'
