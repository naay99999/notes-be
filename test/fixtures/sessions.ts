export const mockSession = {
  id: 'session-123',
  userId: 'user-123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

export const mockExpiredSession = {
  id: 'session-expired',
  userId: 'user-123',
  expiresAt: new Date('2023-12-01T00:00:00Z'), // Expired
  createdAt: new Date('2023-11-01T00:00:00Z'),
}

export const mockSession2 = {
  id: 'session-456',
  userId: 'user-456',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date('2024-01-01T00:00:00Z'),
}
