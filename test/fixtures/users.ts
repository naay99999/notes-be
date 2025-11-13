export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPass123',
    name: 'Test User',
  },
  anotherUser: {
    email: 'another@example.com',
    password: 'AnotherPass123',
    name: 'Another User',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'TestPass123',
    name: 'Invalid User',
  },
  shortPassword: {
    email: 'short@example.com',
    password: '123',
    name: 'Short Password User',
  },
  unicodeUser: {
    email: 'unicode@example.com',
    password: 'UnicodePass123',
    name: 'ทดสอบ Unicode 中文 日本語',
  },
}

export const mockUserInDb = {
  id: 'user-123',
  email: 'test@example.com',
  password: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword', // Mock hashed password
  name: 'Test User',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}

export const mockUserInDb2 = {
  id: 'user-456',
  email: 'another@example.com',
  password: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword2',
  name: 'Another User',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}
