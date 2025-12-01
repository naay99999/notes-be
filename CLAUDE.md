# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia (fast, type-safe web framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based with secure cookies
- **API Documentation**: Swagger/OpenAPI 3.0
- **Language**: TypeScript with strict mode enabled
- **Module System**: ES2022 modules

## Development Commands

```bash
# Start development server with hot reload
bun run dev

# Install dependencies
bun install

# Testing commands
bun test                      # Run all tests
bun test:watch               # Run tests in watch mode
bun test:coverage            # Run tests with coverage report
bun test:unit                # Run unit tests only
bun test:integration         # Run integration tests only

# Database commands
bunx prisma migrate dev        # Create and apply migrations
bunx prisma generate          # Generate Prisma client
bunx prisma studio            # Open Prisma Studio (database GUI)
bunx prisma db push           # Push schema changes without migrations
```

The development server runs on http://localhost:3000 by default.

## API Documentation

Interactive API documentation is available via Swagger UI:
- **Swagger UI**: http://localhost:3000/swagger
- **OpenAPI JSON**: http://localhost:3000/swagger/json

The Swagger documentation includes:
- All API endpoints with detailed descriptions
- Request/response schemas with examples
- Authentication requirements for protected routes
- Response status codes and error messages
- Try-it-out functionality for testing endpoints

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure `DATABASE_URL` with your PostgreSQL connection string
3. Generate a secure `SESSION_SECRET` (minimum 32 characters)
4. Run `bunx prisma migrate dev` to set up the database
5. Start the server with `bun run dev`

## Project Structure

```
src/
├── index.ts                 # Main app with middleware and route setup
├── config/env.ts           # Environment configuration and validation
├── db/index.ts             # Prisma client singleton
├── middleware/
│   └── error.ts           # Global error handler
├── routes/
│   ├── auth/              # Authentication routes (register, login, logout, me)
│   │   ├── index.ts       # Route definitions
│   │   ├── handlers.ts    # Route handlers
│   │   └── validators.ts  # TypeBox validation schemas
│   └── notes/             # Notes CRUD routes
│       ├── index.ts       # Route definitions
│       ├── handlers.ts    # Route handlers
│       └── validators.ts  # TypeBox validation schemas
├── services/
│   ├── auth.service.ts    # User registration and login logic
│   ├── session.service.ts # Session management (create, validate, delete, cleanup)
│   └── note.service.ts    # Note CRUD operations with ownership checks
└── utils/
    └── password.ts        # Password hashing with Argon2id

test/
├── setup.ts               # Global test setup and environment config
├── helpers/               # Test utilities and helper functions
│   ├── app.ts            # Test app instance without rate limiting
│   ├── cookies.ts        # Cookie parsing and manipulation
│   ├── mock-prisma.ts    # Prisma mocking utilities
│   └── request.ts        # HTTP request helpers
├── fixtures/              # Test data and mock objects
│   ├── users.ts          # User test fixtures
│   ├── notes.ts          # Note test fixtures
│   └── sessions.ts       # Session test fixtures
├── unit/                  # Unit tests (46 tests)
│   ├── utils/
│   │   └── password.test.ts
│   └── services/
│       ├── auth.service.test.ts
│       ├── session.service.test.ts
│       └── note.service.test.ts
└── integration/           # Integration tests (52 tests)
    ├── auth/
    │   ├── register.test.ts
    │   └── complete-auth-flow.test.ts
    ├── notes/
    │   └── notes-crud.test.ts
    └── security/
        └── security.test.ts
```

## Architecture

### Session-Based Authentication

- Sessions are stored in PostgreSQL (Session model)
- Session IDs are stored in httpOnly cookies for security
- Cookies configured with: `httpOnly`, `secure` (in production), `sameSite: 'lax'`
- Sessions expire after 7 days (configurable via SESSION_MAX_AGE)
- Automatic cleanup of expired sessions runs hourly

### Database Models

**User**: `id`, `email` (unique), `password` (hashed), `name`, `createdAt`, `updatedAt`
**Note**: `id`, `title`, `content`, `userId` (foreign key), `createdAt`, `updatedAt`
**Session**: `id`, `userId` (foreign key), `expiresAt`, `createdAt`

### Authentication Pattern

Authentication is implemented using Elysia's `.derive()` method directly in route files:
- Each protected route group (auth, notes) uses `.derive()` to validate session cookies
- The derivation validates `sessionId` cookie and injects `user` and `session` objects into context
- This approach ensures context is properly propagated to all route handlers

**Important**: Do NOT use `.use(createAuthMiddleware())` pattern - it causes context propagation issues in Elysia. Always use `.derive()` directly in the route file before defining protected routes.

Example:
```typescript
export const noteRoutes = new Elysia({ prefix: "/notes" })
  .derive(async ({ cookie: { sessionId }, set }) => {
    if (!sessionId?.value) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    const result = await SessionService.validateSession(sessionId.value);
    if (!result) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    return { user: result.user, session: result.session };
  })
  .get("/", handler) // now has access to user and session
```

### Other Middleware

- **errorHandler**: Global error handler with custom error messages and status codes
- **Security plugins**: CORS, Helmet (security headers), Rate limiting (100 req/min)

### Route Organization

Routes are organized by feature (auth, notes) with separate files for:
- **validators.ts**: TypeBox schemas for request validation
- **handlers.ts**: Business logic for each route
- **index.ts**: Route definitions with middleware and schema binding

### Service Layer Pattern

Services contain business logic and database operations:
- **AuthService**: User registration and login with password hashing
- **SessionService**: Session lifecycle management
- **NoteService**: CRUD operations with ownership validation

### Security Features

1. **Password Security**: Argon2id hashing via Bun's native crypto
2. **CSRF Protection**: SameSite cookies prevent CSRF attacks
3. **Rate Limiting**: 100 requests per minute per IP
4. **Security Headers**: Helmet plugin sets secure HTTP headers
5. **Input Validation**: TypeBox schemas validate all inputs
6. **CORS**: Restricted to configured frontend URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (email, password, name)
- `POST /api/auth/login` - Login user (email, password)
- `POST /api/auth/logout` - Logout user (clears session)
- `GET /api/auth/me` - Get current user (protected)

### Notes
- `POST /api/notes` - Create note (protected)
- `GET /api/notes` - Get all user's notes (protected)
- `GET /api/notes/:id` - Get specific note (protected)
- `PATCH /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)

### System
- `GET /` - Welcome message
- `GET /health` - Health check

## Testing

### Test Suite Overview

The project uses **Bun's built-in test runner** with **mock-based testing** for fast, isolated tests without requiring a database.

**Test Coverage**: 98 tests, 88% line coverage, 84% function coverage

**Test Categories**:
- **Unit Tests (46)**: Services, utils, password hashing with full coverage
- **Integration Tests (52)**: Auth routes, notes CRUD, security, error handling

### Running Tests

```bash
bun test                    # Run all tests (fast, ~500ms)
bun test:watch             # Watch mode for development
bun test:coverage          # Generate coverage report
bun test:unit              # Run only unit tests
bun test:integration       # Run only integration tests

# Run specific test file
bun test test/unit/services/auth.service.test.ts

# Run tests matching pattern
bun test --test-name-pattern "should create"
```

### Testing Architecture

**Mock-Based Approach**: All tests use `prisma-mock` to mock database operations, eliminating the need for a test database and ensuring fast, isolated tests.

**Test Helpers**:
- `test/helpers/app.ts`: Creates test Elysia app instance without rate limiting
- `test/helpers/request.ts`: HTTP request builders with cookie support
- `test/helpers/cookies.ts`: Cookie parsing and session ID extraction
- `test/helpers/mock-prisma.ts`: Prisma client mocking utilities

**Test Fixtures**: Reusable test data in `test/fixtures/` for users, notes, and sessions

**Testing Pattern**:
```typescript
// Unit test example
import { mock } from 'bun:test'
const mockPrisma = { user: { create: mock() } }
mock.module('../../src/db', () => ({ prisma: mockPrisma }))

// Integration test example
const app = createTestApp()
const response = await app.handle(createJsonRequest(...))
```

### Test Coverage Requirements

- **Core Services**: 100% coverage (auth, session, note services)
- **Routes & Handlers**: 100% coverage
- **Password Utils**: 100% coverage
- **Overall Target**: >90% line coverage

### Writing New Tests

1. **Unit Tests**: Test service methods in isolation with mocked Prisma
2. **Integration Tests**: Test HTTP endpoints with `app.handle()` and mocked database
3. **Use Fixtures**: Import test data from `test/fixtures/` for consistency
4. **Mock Prisma**: Always mock database calls using `prisma-mock` or `mock.module()`
5. **Test IDs**: Include TC-XXX-NNN IDs matching test-cases.md for traceability

## Key Conventions

- **Service classes**: Use static methods for stateless operations
- **Error handling**: Throw descriptive errors; global handler maps to HTTP status codes
- **Ownership validation**: All note operations verify user owns the resource
- **Type safety**: Leverage Elysia's TypeBox for runtime validation and type inference
- **Password handling**: Never log or expose passwords; always use select to exclude them
- **Session management**: Always validate session expiration before use
- **API Documentation**: All routes must include `detail` with tags, summary, description, and response codes
- **Schema Documentation**: All TypeBox schemas should include descriptions and examples for better Swagger docs
- **Testing**: Write tests for all new features; use mock-based approach with prisma-mock