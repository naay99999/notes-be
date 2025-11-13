import { PrismaMock } from 'prisma-mock'
import type { PrismaClient } from '@prisma/client'

let prismaMockInstance: PrismaMock | null = null

export function createMockPrisma(): PrismaMock {
  prismaMockInstance = new PrismaMock()
  return prismaMockInstance
}

export function getMockPrisma(): PrismaMock {
  if (!prismaMockInstance) {
    prismaMockInstance = createMockPrisma()
  }
  return prismaMockInstance
}

export function resetMockPrisma() {
  prismaMockInstance = null
}

// Helper to mock Prisma in tests
export function mockPrismaModule(prisma: PrismaMock) {
  // This will be used with Bun's mock.module()
  return {
    prisma: prisma as unknown as PrismaClient,
  }
}
