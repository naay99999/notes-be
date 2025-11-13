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
│   ├── auth.ts            # Authentication middleware (session validation)
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

### Middleware Pattern

- **authMiddleware**: Uses Elysia's `.derive()` to validate session and inject `user` object into route context
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

## Key Conventions

- **Service classes**: Use static methods for stateless operations
- **Error handling**: Throw descriptive errors; global handler maps to HTTP status codes
- **Ownership validation**: All note operations verify user owns the resource
- **Type safety**: Leverage Elysia's TypeBox for runtime validation and type inference
- **Password handling**: Never log or expose passwords; always use select to exclude them
- **Session management**: Always validate session expiration before use
- **API Documentation**: All routes must include `detail` with tags, summary, description, and response codes
- **Schema Documentation**: All TypeBox schemas should include descriptions and examples for better Swagger docs
