// Authentication and session related types

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'never'> {
  // User without password field - automatically handled by Prisma
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthenticatedContext {
  user: User;
  session: Session;
}

export interface AuthenticatedUser {
  user: UserWithoutPassword;
}

// Service method return types
export interface AuthResult {
  user: User;
  sessionId: string;
}

export interface LoginResult {
  user: User;
  sessionId: string;
}

export interface SessionValidationResult {
  user: User;
  session: Session;
}

// Error types
export interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_EXISTS' | 'SESSION_INVALID';
  message: string;
}