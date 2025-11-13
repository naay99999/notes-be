import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { errorHandler } from '../../src/middleware/error'
import { authRoutes } from '../../src/routes/auth'
import { noteRoutes } from '../../src/routes/notes'

/**
 * Creates a test instance of the Elysia app without rate limiting
 * This allows tests to run without hitting rate limit constraints
 */
export function createTestApp() {
  return new Elysia()
    .use(errorHandler)
    .use(
      cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    )
    .get('/', () => ({ message: 'Welcome to Notes API' }))
    .get('/health', () => ({ status: 'ok' }))
    .use(authRoutes)
    .use(noteRoutes)
}

export type TestApp = ReturnType<typeof createTestApp>
