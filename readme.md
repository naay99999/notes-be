# Notes API

> **⚠️ AI-Generated Project Notice**
>
> This project was entirely generated and developed by **Claude AI** (claude.ai/code) as an experimental demonstration of AI-assisted software development. The entire codebase, including architecture design, implementation, testing suite, and documentation, was created through AI assistance.

A secure, type-safe REST API for managing notes with user authentication. Built with Bun, Elysia, and PostgreSQL.

## Features

- **User Authentication**: Session-based authentication with secure cookies
- **Notes Management**: Full CRUD operations for personal notes
- **Type Safety**: End-to-end type safety with TypeScript and TypeBox
- **API Documentation**: Interactive Swagger UI for testing endpoints
- **Security**: Rate limiting, CORS, secure headers, and Argon2id password hashing
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia (fast, type-safe web framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based with secure cookies
- **API Documentation**: Swagger/OpenAPI 3.0
- **Language**: TypeScript with strict mode

## Prerequisites

- [Bun](https://bun.sh) (v1.0 or higher)
- PostgreSQL (v14 or higher)

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/notes_db?schema=public"

# Server
PORT=3000
NODE_ENV=development

# Session (generate a secure random string, minimum 32 characters)
SESSION_SECRET="your-secure-random-string-here"
SESSION_MAX_AGE=604800000

# Frontend (for CORS)
FRONTEND_URL="http://localhost:5173"
```

**Generate a secure SESSION_SECRET**:
```bash
openssl rand -base64 48
```

### 3. Database Setup

Create and apply database migrations:

```bash
# Generate Prisma client
bunx prisma generate

# Create and apply migrations
bunx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
bun run dev
```

The server will start at `http://localhost:3000` with hot reload enabled.

## API Documentation

### Swagger UI

Access the interactive API documentation at:

**🚀 [http://localhost:3000/swagger](http://localhost:3000/swagger)**

The Swagger UI provides:
- Complete list of all endpoints with descriptions
- Request/response schemas with examples
- Authentication requirements
- Try-it-out functionality to test endpoints directly
- Response status codes and error messages

### OpenAPI JSON

The raw OpenAPI specification is available at:
- [http://localhost:3000/swagger/json](http://localhost:3000/swagger/json)

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login user | No |
| `POST` | `/api/auth/logout` | Logout user | Yes |
| `GET` | `/api/auth/me` | Get current user | Yes |

### Notes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/notes` | Create a new note | Yes |
| `GET` | `/api/notes` | Get all user's notes | Yes |
| `GET` | `/api/notes/:id` | Get specific note | Yes |
| `PATCH` | `/api/notes/:id` | Update note | Yes |
| `DELETE` | `/api/notes/:id` | Delete note | Yes |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Welcome message | No |
| `GET` | `/health` | Health check | No |

## Example Usage

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Create a Note

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my note"
  }'
```

### Get All Notes

```bash
curl -X GET http://localhost:3000/api/notes \
  -b cookies.txt
```

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

# View database in GUI
bunx prisma studio
```

## Project Structure

```
src/
├── index.ts                 # Main app with middleware and route setup
├── config/env.ts           # Environment configuration and validation
├── db/index.ts             # Prisma client singleton
├── middleware/
│   ├── auth.ts            # Authentication middleware
│   └── error.ts           # Global error handler
├── routes/
│   ├── auth/              # Authentication routes
│   │   ├── index.ts       # Route definitions
│   │   ├── handlers.ts    # Route handlers
│   │   └── validators.ts  # Validation schemas
│   └── notes/             # Notes CRUD routes
│       ├── index.ts       # Route definitions
│       ├── handlers.ts    # Route handlers
│       └── validators.ts  # Validation schemas
├── services/
│   ├── auth.service.ts    # User registration and login
│   ├── session.service.ts # Session management
│   └── note.service.ts    # Note CRUD operations
└── utils/
    └── password.ts        # Password hashing utilities
```

## Security Features

- **Password Security**: Argon2id hashing via Bun's native crypto
- **Session Management**: Secure httpOnly cookies with 7-day expiration
- **CSRF Protection**: SameSite cookies prevent CSRF attacks
- **Rate Limiting**: 100 requests per minute per IP
- **Security Headers**: Helmet plugin for secure HTTP headers
- **Input Validation**: TypeBox schemas validate all inputs
- **CORS**: Restricted to configured frontend URL

## Database Models

### User
- `id`: UUID (primary key)
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Note
- `id`: UUID (primary key)
- `title`: String
- `content`: String
- `userId`: UUID (foreign key)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Session
- `id`: UUID (primary key)
- `userId`: UUID (foreign key)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## Troubleshooting

### Prisma Client Not Generated

```bash
bunx prisma generate
```

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify DATABASE_URL credentials in `.env`
- Check if the database exists

### Port Already in Use

Change the `PORT` in `.env` or stop the process using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

## Testing

This project includes a comprehensive test suite with 98 tests achieving 88% code coverage.

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run only unit tests
bun test:unit

# Run only integration tests
bun test:integration
```

**Test Coverage**:
- Unit tests (46): Services, utils, password hashing
- Integration tests (52): Auth routes, notes CRUD, security, error handling
- Mock-based testing using `prisma-mock` for fast, isolated tests

## License

This project is free and open source, available for anyone to use, modify, and distribute.

**UNLICENSE** - This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.