# Test Cases Documentation

This document contains comprehensive test cases for the Notes API backend application.

## Table of Contents

1. [Authentication Tests](#authentication-tests)
2. [Notes CRUD Tests](#notes-crud-tests)
3. [Session Management Tests](#session-management-tests)
4. [Security Tests](#security-tests)
5. [Validation Tests](#validation-tests)
6. [Error Handling Tests](#error-handling-tests)
7. [Integration Tests](#integration-tests)

---

## Authentication Tests

### 1. User Registration

#### TC-AUTH-001: Successful User Registration
**Description**: User should be able to register with valid credentials
**Endpoint**: `POST /api/auth/register`
**Prerequisites**: None

**Test Data**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Expected Result**:
- Status Code: `201`
- Response contains user object (without password)
- Session cookie is set with `httpOnly`, `sameSite: lax`
- User is created in database
- Session is created in database

**Assertions**:
- `response.status === 201`
- `response.body.user.email === "newuser@example.com"`
- `response.body.user.name === "John Doe"`
- `response.body.user.password === undefined`
- `response.headers['set-cookie']` contains `sessionId`
- Cookie has `httpOnly` flag
- Cookie has `sameSite=lax`

---

#### TC-AUTH-002: Register with Duplicate Email
**Description**: System should prevent registration with existing email
**Endpoint**: `POST /api/auth/register`
**Prerequisites**: User with `existing@example.com` already exists

**Test Data**:
```json
{
  "email": "existing@example.com",
  "password": "SecurePass123",
  "name": "Jane Doe"
}
```

**Expected Result**:
- Status Code: `409`
- Error message: "User already exists"
- No new user created
- No session created

**Assertions**:
- `response.status === 409`
- `response.body.error === "Conflict"`
- `response.body.message === "User already exists"`

---

#### TC-AUTH-003: Register Without Name (Optional Field)
**Description**: User should be able to register without providing name
**Endpoint**: `POST /api/auth/register`
**Prerequisites**: None

**Test Data**:
```json
{
  "email": "noname@example.com",
  "password": "SecurePass123"
}
```

**Expected Result**:
- Status Code: `201`
- User created with `name: null`
- Session created and cookie set

**Assertions**:
- `response.status === 201`
- `response.body.user.name === null`
- Session cookie is present

---

#### TC-AUTH-004: Register with Invalid Email Format
**Description**: System should reject invalid email format
**Endpoint**: `POST /api/auth/register`
**Prerequisites**: None

**Test Data**:
```json
{
  "email": "invalid-email",
  "password": "SecurePass123",
  "name": "Test User"
}
```

**Expected Result**:
- Status Code: `400`
- Validation error for email format

**Assertions**:
- `response.status === 400`
- `response.body.error === "Validation error"`

---

#### TC-AUTH-005: Register with Short Password
**Description**: System should reject password shorter than 8 characters
**Endpoint**: `POST /api/auth/register`
**Prerequisites**: None

**Test Data**:
```json
{
  "email": "test@example.com",
  "password": "Short1",
  "name": "Test User"
}
```

**Expected Result**:
- Status Code: `400`
- Validation error for password length

**Assertions**:
- `response.status === 400`
- `response.body.error === "Validation error"`
- Error mentions minimum length requirement

---

### 2. User Login

#### TC-AUTH-006: Successful Login
**Description**: User should be able to login with correct credentials
**Endpoint**: `POST /api/auth/login`
**Prerequisites**: User exists with email `user@example.com` and password `SecurePass123`

**Test Data**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Expected Result**:
- Status Code: `200`
- Response contains user object (without password)
- Session cookie is set
- New session created in database

**Assertions**:
- `response.status === 200`
- `response.body.user.email === "user@example.com"`
- `response.body.user.password === undefined`
- Session cookie is present with correct attributes

---

#### TC-AUTH-007: Login with Wrong Password
**Description**: System should reject login with incorrect password
**Endpoint**: `POST /api/auth/login`
**Prerequisites**: User exists with email `user@example.com`

**Test Data**:
```json
{
  "email": "user@example.com",
  "password": "WrongPassword123"
}
```

**Expected Result**:
- Status Code: `401`
- Error message: "Invalid credentials"
- No session created

**Assertions**:
- `response.status === 401`
- `response.body.error === "Unauthorized"`
- `response.body.message === "Invalid credentials"`

---

#### TC-AUTH-008: Login with Non-existent Email
**Description**: System should reject login with email that doesn't exist
**Endpoint**: `POST /api/auth/login`
**Prerequisites**: None

**Test Data**:
```json
{
  "email": "nonexistent@example.com",
  "password": "AnyPassword123"
}
```

**Expected Result**:
- Status Code: `401`
- Error message: "Invalid credentials"
- No session created

**Assertions**:
- `response.status === 401`
- `response.body.message === "Invalid credentials"`

---

### 3. User Logout

#### TC-AUTH-009: Successful Logout
**Description**: Authenticated user should be able to logout
**Endpoint**: `POST /api/auth/logout`
**Prerequisites**: User is authenticated with valid session

**Test Data**: None (session cookie in request)

**Expected Result**:
- Status Code: `200`
- Success message
- Session deleted from database
- Session cookie removed

**Assertions**:
- `response.status === 200`
- `response.body.message === "Logged out successfully"`
- Session no longer exists in database

---

#### TC-AUTH-010: Logout Without Session
**Description**: Logout should succeed even without active session
**Endpoint**: `POST /api/auth/logout`
**Prerequisites**: No session cookie

**Test Data**: None

**Expected Result**:
- Status Code: `200`
- Success message

**Assertions**:
- `response.status === 200`
- `response.body.message === "Logged out successfully"`

---

### 4. Get Current User

#### TC-AUTH-011: Get Current User with Valid Session
**Description**: Authenticated user should be able to get their info
**Endpoint**: `GET /api/auth/me`
**Prerequisites**: User is authenticated with valid session

**Test Data**: None (session cookie in request)

**Expected Result**:
- Status Code: `200`
- Response contains user object without password

**Assertions**:
- `response.status === 200`
- `response.body.user.id` exists
- `response.body.user.email` exists
- `response.body.user.password === undefined`

---

#### TC-AUTH-012: Get Current User Without Session
**Description**: Request should fail without valid session
**Endpoint**: `GET /api/auth/me`
**Prerequisites**: No session cookie

**Test Data**: None

**Expected Result**:
- Status Code: `401`
- Error message: "Unauthorized"

**Assertions**:
- `response.status === 401`
- `response.body.error === "Unauthorized"`

---

#### TC-AUTH-013: Get Current User with Expired Session
**Description**: Request should fail with expired session
**Endpoint**: `GET /api/auth/me`
**Prerequisites**: Session exists but has expired

**Test Data**: Expired session cookie

**Expected Result**:
- Status Code: `401`
- Expired session deleted from database

**Assertions**:
- `response.status === 401`
- Session no longer exists in database

---

## Notes CRUD Tests

### 1. Create Note

#### TC-NOTE-001: Create Note Successfully
**Description**: Authenticated user should be able to create a note
**Endpoint**: `POST /api/notes`
**Prerequisites**: User is authenticated

**Test Data**:
```json
{
  "title": "My First Note",
  "content": "This is the content of my note"
}
```

**Expected Result**:
- Status Code: `201`
- Response contains created note with generated ID
- Note is saved to database with correct userId

**Assertions**:
- `response.status === 201`
- `response.body.note.id` exists (UUID format)
- `response.body.note.title === "My First Note"`
- `response.body.note.content === "This is the content of my note"`
- `response.body.note.userId === currentUser.id`
- `response.body.note.createdAt` exists
- `response.body.note.updatedAt` exists

---

#### TC-NOTE-002: Create Note Without Authentication
**Description**: Unauthenticated request should fail
**Endpoint**: `POST /api/notes`
**Prerequisites**: No valid session

**Test Data**:
```json
{
  "title": "Test Note",
  "content": "Test content"
}
```

**Expected Result**:
- Status Code: `401`
- No note created

**Assertions**:
- `response.status === 401`
- `response.body.error === "Unauthorized"`

---

#### TC-NOTE-003: Create Note with Empty Title
**Description**: System should reject note with empty title
**Endpoint**: `POST /api/notes`
**Prerequisites**: User is authenticated

**Test Data**:
```json
{
  "title": "",
  "content": "Some content"
}
```

**Expected Result**:
- Status Code: `400`
- Validation error

**Assertions**:
- `response.status === 400`
- `response.body.error === "Validation error"`

---

#### TC-NOTE-004: Create Note with Title Exceeding Max Length
**Description**: System should reject title longer than 255 characters
**Endpoint**: `POST /api/notes`
**Prerequisites**: User is authenticated

**Test Data**:
```json
{
  "title": "A".repeat(256),
  "content": "Some content"
}
```

**Expected Result**:
- Status Code: `400`
- Validation error for title length

**Assertions**:
- `response.status === 400`
- Error mentions maximum length

---

#### TC-NOTE-005: Create Note with Missing Required Fields
**Description**: System should reject request without title or content
**Endpoint**: `POST /api/notes`
**Prerequisites**: User is authenticated

**Test Data**:
```json
{
  "title": "Only Title"
}
```

**Expected Result**:
- Status Code: `400`
- Validation error

**Assertions**:
- `response.status === 400`
- Error mentions missing required field

---

### 2. Get All Notes

#### TC-NOTE-006: Get All Notes for User
**Description**: User should get all their notes ordered by most recently updated
**Endpoint**: `GET /api/notes`
**Prerequisites**: User is authenticated and has 3 notes

**Test Data**: None

**Expected Result**:
- Status Code: `200`
- Response contains array of notes
- Notes are ordered by `updatedAt` DESC
- Only user's own notes are returned

**Assertions**:
- `response.status === 200`
- `response.body.notes` is an array
- `response.body.notes.length === 3`
- Notes are sorted by `updatedAt` (most recent first)
- All notes have `userId === currentUser.id`

---

#### TC-NOTE-007: Get All Notes for User with No Notes
**Description**: User with no notes should get empty array
**Endpoint**: `GET /api/notes`
**Prerequisites**: User is authenticated but has no notes

**Test Data**: None

**Expected Result**:
- Status Code: `200`
- Response contains empty array

**Assertions**:
- `response.status === 200`
- `response.body.notes === []`

---

#### TC-NOTE-008: Get All Notes Without Authentication
**Description**: Unauthenticated request should fail
**Endpoint**: `GET /api/notes`
**Prerequisites**: No valid session

**Test Data**: None

**Expected Result**:
- Status Code: `401`

**Assertions**:
- `response.status === 401`

---

### 3. Get Single Note

#### TC-NOTE-009: Get Note by ID Successfully
**Description**: User should be able to get their own note by ID
**Endpoint**: `GET /api/notes/:id`
**Prerequisites**: User is authenticated and owns a note

**Test Data**: Valid note ID that belongs to user

**Expected Result**:
- Status Code: `200`
- Response contains note details

**Assertions**:
- `response.status === 200`
- `response.body.note.id === requestedNoteId`
- All note fields are present

---

#### TC-NOTE-010: Get Note That Doesn't Exist
**Description**: Request for non-existent note should fail
**Endpoint**: `GET /api/notes/:id`
**Prerequisites**: User is authenticated

**Test Data**: Non-existent UUID

**Expected Result**:
- Status Code: `404`
- Error message: "Note not found"

**Assertions**:
- `response.status === 404`
- `response.body.message === "Note not found"`

---

#### TC-NOTE-011: Get Note Owned by Another User
**Description**: User should not be able to access another user's note
**Endpoint**: `GET /api/notes/:id`
**Prerequisites**: User is authenticated, note exists but belongs to different user

**Test Data**: Note ID belonging to another user

**Expected Result**:
- Status Code: `404`
- Error message: "Note not found"

**Assertions**:
- `response.status === 404`
- `response.body.message === "Note not found"`

---

#### TC-NOTE-012: Get Note Without Authentication
**Description**: Unauthenticated request should fail
**Endpoint**: `GET /api/notes/:id`
**Prerequisites**: No valid session

**Test Data**: Any note ID

**Expected Result**:
- Status Code: `401`

**Assertions**:
- `response.status === 401`

---

### 4. Update Note

#### TC-NOTE-013: Update Note Title and Content
**Description**: User should be able to update both title and content
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: User is authenticated and owns the note

**Test Data**:
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Expected Result**:
- Status Code: `200`
- Response contains updated note
- `updatedAt` timestamp is updated

**Assertions**:
- `response.status === 200`
- `response.body.note.title === "Updated Title"`
- `response.body.note.content === "Updated content"`
- `response.body.note.updatedAt > originalUpdatedAt`

---

#### TC-NOTE-014: Update Only Title
**Description**: User should be able to update only title
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: User is authenticated and owns the note

**Test Data**:
```json
{
  "title": "New Title Only"
}
```

**Expected Result**:
- Status Code: `200`
- Title is updated
- Content remains unchanged

**Assertions**:
- `response.status === 200`
- `response.body.note.title === "New Title Only"`
- `response.body.note.content === originalContent`

---

#### TC-NOTE-015: Update Only Content
**Description**: User should be able to update only content
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: User is authenticated and owns the note

**Test Data**:
```json
{
  "content": "New content only"
}
```

**Expected Result**:
- Status Code: `200`
- Content is updated
- Title remains unchanged

**Assertions**:
- `response.status === 200`
- `response.body.note.content === "New content only"`
- `response.body.note.title === originalTitle`

---

#### TC-NOTE-016: Update Note Owned by Another User
**Description**: User should not be able to update another user's note
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: User is authenticated, note belongs to different user

**Test Data**:
```json
{
  "title": "Hacked Title"
}
```

**Expected Result**:
- Status Code: `404`
- Note is not updated

**Assertions**:
- `response.status === 404`
- Original note remains unchanged

---

#### TC-NOTE-017: Update Non-existent Note
**Description**: Update should fail for non-existent note
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: User is authenticated

**Test Data**:
```json
{
  "title": "Updated Title"
}
```

**Expected Result**:
- Status Code: `404`

**Assertions**:
- `response.status === 404`
- `response.body.message === "Note not found"`

---

#### TC-NOTE-018: Update Note Without Authentication
**Description**: Unauthenticated request should fail
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: No valid session

**Test Data**:
```json
{
  "title": "Updated Title"
}
```

**Expected Result**:
- Status Code: `401`

**Assertions**:
- `response.status === 401`

---

#### TC-NOTE-019: Update Note with Empty Body
**Description**: Update with empty body should succeed (no changes)
**Endpoint**: `PATCH /api/notes/:id`
**Prerequisites**: User is authenticated and owns the note

**Test Data**:
```json
{}
```

**Expected Result**:
- Status Code: `200`
- Note remains unchanged except `updatedAt`

**Assertions**:
- `response.status === 200`
- Title and content unchanged
- `updatedAt` is updated

---

### 5. Delete Note

#### TC-NOTE-020: Delete Note Successfully
**Description**: User should be able to delete their own note
**Endpoint**: `DELETE /api/notes/:id`
**Prerequisites**: User is authenticated and owns the note

**Test Data**: None

**Expected Result**:
- Status Code: `204`
- No response body
- Note is deleted from database

**Assertions**:
- `response.status === 204`
- Note no longer exists in database

---

#### TC-NOTE-021: Delete Note Owned by Another User
**Description**: User should not be able to delete another user's note
**Endpoint**: `DELETE /api/notes/:id`
**Prerequisites**: User is authenticated, note belongs to different user

**Test Data**: None

**Expected Result**:
- Status Code: `404`
- Note is not deleted

**Assertions**:
- `response.status === 404`
- Note still exists in database

---

#### TC-NOTE-022: Delete Non-existent Note
**Description**: Delete should fail for non-existent note
**Endpoint**: `DELETE /api/notes/:id`
**Prerequisites**: User is authenticated

**Test Data**: Non-existent UUID

**Expected Result**:
- Status Code: `404`

**Assertions**:
- `response.status === 404`
- `response.body.message === "Note not found"`

---

#### TC-NOTE-023: Delete Note Without Authentication
**Description**: Unauthenticated request should fail
**Endpoint**: `DELETE /api/notes/:id`
**Prerequisites**: No valid session

**Test Data**: None

**Expected Result**:
- Status Code: `401`

**Assertions**:
- `response.status === 401`

---

## Session Management Tests

#### TC-SESSION-001: Session Creation on Registration
**Description**: Session should be created when user registers
**Prerequisites**: None

**Test Steps**:
1. Register new user
2. Check database for session

**Expected Result**:
- Session exists in database
- Session has correct `userId`
- Session `expiresAt` is 7 days in future
- Session cookie matches database ID

---

#### TC-SESSION-002: Session Creation on Login
**Description**: New session should be created when user logs in
**Prerequisites**: User exists

**Test Steps**:
1. Login user
2. Check database for session

**Expected Result**:
- New session created
- Old sessions (if any) still exist
- Session `expiresAt` is 7 days in future

---

#### TC-SESSION-003: Session Validation
**Description**: Valid session should allow access to protected routes
**Prerequisites**: User has valid session

**Test Steps**:
1. Make request to protected route with session cookie
2. Verify access granted

**Expected Result**:
- Request succeeds
- User object is available in handler

---

#### TC-SESSION-004: Expired Session Handling
**Description**: Expired session should be rejected and deleted
**Prerequisites**: Session exists but has expired

**Test Steps**:
1. Make request with expired session cookie
2. Check database

**Expected Result**:
- Request fails with 401
- Expired session is deleted from database

---

#### TC-SESSION-005: Invalid Session ID
**Description**: Invalid session ID should be rejected
**Prerequisites**: None

**Test Steps**:
1. Make request with non-existent session ID

**Expected Result**:
- Request fails with 401
- Error message indicates unauthorized

---

#### TC-SESSION-006: Session Cleanup Job
**Description**: Expired sessions should be cleaned up hourly
**Prerequisites**: Multiple expired sessions exist

**Test Steps**:
1. Create sessions with past expiration dates
2. Wait for or trigger cleanup job
3. Check database

**Expected Result**:
- All expired sessions are deleted
- Active sessions remain

---

#### TC-SESSION-007: Multiple Sessions Per User
**Description**: User should be able to have multiple active sessions
**Prerequisites**: User exists

**Test Steps**:
1. Login from device 1
2. Login from device 2
3. Both sessions should work

**Expected Result**:
- Two sessions exist for same user
- Both sessions work independently
- Logging out one doesn't affect the other

---

#### TC-SESSION-008: Session Cookie Attributes
**Description**: Session cookie should have correct security attributes
**Prerequisites**: None

**Test Steps**:
1. Register or login
2. Inspect Set-Cookie header

**Expected Result**:
- Cookie has `HttpOnly` flag
- Cookie has `SameSite=Lax`
- Cookie has `Secure` flag in production
- Cookie has `Path=/`
- Cookie has `Max-Age` set to 7 days

---

## Security Tests

#### TC-SEC-001: Password Hashing
**Description**: Passwords should be hashed with Argon2id
**Prerequisites**: None

**Test Steps**:
1. Register user
2. Check database for password field

**Expected Result**:
- Password is hashed (not plaintext)
- Hash format matches Argon2id
- Same password produces different hashes (salt)

---

#### TC-SEC-002: Password Not Returned in Responses
**Description**: Password should never be included in API responses
**Prerequisites**: None

**Test Steps**:
1. Register user
2. Login user
3. Get current user

**Expected Result**:
- All responses exclude password field
- User object has no password property

---

#### TC-SEC-003: Rate Limiting
**Description**: API should limit requests to 100 per minute
**Prerequisites**: None

**Test Steps**:
1. Make 100 requests to any endpoint
2. Make 101st request

**Expected Result**:
- First 100 requests succeed
- 101st request fails with 429 (Too Many Requests)

---

#### TC-SEC-004: CORS Configuration
**Description**: CORS should only allow configured frontend URL
**Prerequisites**: FRONTEND_URL is configured

**Test Steps**:
1. Make request from allowed origin
2. Make request from different origin

**Expected Result**:
- Request from allowed origin succeeds
- Request from other origin is blocked
- Credentials are allowed for allowed origin

---

#### TC-SEC-005: Security Headers
**Description**: Response should include security headers from Helmet
**Prerequisites**: None

**Test Steps**:
1. Make any request
2. Inspect response headers

**Expected Result**:
- Headers include security policies
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- Other Helmet headers present

---

#### TC-SEC-006: SQL Injection Prevention
**Description**: System should prevent SQL injection
**Prerequisites**: User is authenticated

**Test Steps**:
1. Attempt SQL injection in note title
2. Attempt SQL injection in search parameters

**Test Data**:
```json
{
  "title": "'; DROP TABLE notes; --",
  "content": "Test"
}
```

**Expected Result**:
- Input is safely escaped
- No SQL injection occurs
- Note is created with literal string as title

---

#### TC-SEC-007: XSS Prevention
**Description**: System should prevent XSS attacks
**Prerequisites**: User is authenticated

**Test Steps**:
1. Create note with script tags in content
2. Retrieve note

**Test Data**:
```json
{
  "title": "XSS Test",
  "content": "<script>alert('XSS')</script>"
}
```

**Expected Result**:
- Content is stored as-is
- Frontend should sanitize before rendering
- Script doesn't execute when retrieved

---

## Validation Tests

#### TC-VAL-001: Email Format Validation
**Description**: System should validate email format
**Test Cases**:
- `invalid-email` → Rejected
- `user@` → Rejected
- `@example.com` → Rejected
- `user@example.com` → Accepted
- `user+tag@example.co.uk` → Accepted

---

#### TC-VAL-002: Password Length Validation
**Description**: Password must be at least 8 characters
**Test Cases**:
- `1234567` (7 chars) → Rejected
- `12345678` (8 chars) → Accepted
- Empty string → Rejected
- `verylongpasswordthatexceedsanyreasonablelength` → Accepted

---

#### TC-VAL-003: Note Title Length Validation
**Description**: Note title must be 1-255 characters
**Test Cases**:
- Empty string → Rejected
- `A` (1 char) → Accepted
- `A`.repeat(255) → Accepted
- `A`.repeat(256) → Rejected

---

#### TC-VAL-004: Required Fields Validation
**Description**: Required fields must be provided
**Endpoints**: All POST/PATCH endpoints

**Test Cases**:
- Missing `email` in registration → Rejected
- Missing `password` in registration → Rejected
- Missing `title` in create note → Rejected
- Missing `content` in create note → Rejected

---

#### TC-VAL-005: Type Validation
**Description**: Fields should have correct types
**Test Cases**:
- `email: 123` → Rejected (should be string)
- `password: null` → Rejected
- `title: ["array"]` → Rejected
- `content: {}` → Rejected

---

## Error Handling Tests

#### TC-ERR-001: Validation Error Response Format
**Description**: Validation errors should have consistent format
**Expected Response**:
```json
{
  "error": "Validation error",
  "message": "<detailed error message>"
}
```

---

#### TC-ERR-002: Authentication Error Response Format
**Description**: Auth errors should have consistent format
**Expected Response**:
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to access this resource"
}
```

---

#### TC-ERR-003: Not Found Error Response Format
**Description**: Not found errors should have consistent format
**Expected Response**:
```json
{
  "error": "Not found",
  "message": "Note not found"
}
```

---

#### TC-ERR-004: Conflict Error Response Format
**Description**: Conflict errors should have consistent format
**Expected Response**:
```json
{
  "error": "Conflict",
  "message": "User already exists"
}
```

---

#### TC-ERR-005: Internal Server Error Handling
**Description**: Unexpected errors should be handled gracefully
**Expected Behavior**:
- Status Code: `500`
- Error logged to console
- Generic message in production
- Detailed message in development

---

#### TC-ERR-006: Database Connection Error
**Description**: Database errors should be handled
**Test Steps**:
1. Stop database
2. Make any request

**Expected Result**:
- Status Code: `500`
- Error message (appropriate to environment)
- Request doesn't hang

---

## Integration Tests

#### TC-INT-001: Complete User Journey
**Description**: Full user flow from registration to note management
**Test Steps**:
1. Register new user
2. Verify user in database
3. Login with same credentials
4. Get current user info
5. Create 3 notes
6. Get all notes
7. Update one note
8. Delete one note
9. Get all notes again (should be 2)
10. Logout
11. Try to access protected route (should fail)

**Expected Result**: All steps succeed with expected responses

---

#### TC-INT-002: Multi-User Isolation
**Description**: Users should only see their own data
**Test Steps**:
1. Register User A
2. Create 2 notes for User A
3. Register User B
4. Create 1 note for User B
5. User B tries to get all notes
6. User B tries to access User A's note
7. User B tries to update User A's note
8. User B tries to delete User A's note

**Expected Result**:
- User B only sees their own note
- User B cannot access, update, or delete User A's notes

---

#### TC-INT-003: Session Lifecycle
**Description**: Complete session lifecycle test
**Test Steps**:
1. Login user
2. Verify session created
3. Use session for multiple requests
4. Logout
5. Verify session deleted
6. Try to use old session (should fail)

**Expected Result**: Session properly managed throughout lifecycle

---

#### TC-INT-004: Concurrent Requests
**Description**: System should handle concurrent requests
**Test Steps**:
1. Login user
2. Make 10 concurrent requests to create notes
3. Get all notes

**Expected Result**:
- All 10 notes created successfully
- No race conditions or errors

---

#### TC-INT-005: Database Cascade Delete
**Description**: Deleting user should cascade to notes and sessions
**Test Steps**:
1. Create user
2. Create sessions and notes for user
3. Delete user from database
4. Check notes and sessions tables

**Expected Result**:
- User deleted
- All user's notes deleted (CASCADE)
- All user's sessions deleted (CASCADE)

---

## Performance Tests

#### TC-PERF-001: Response Time for List Notes
**Description**: Getting all notes should be fast
**Prerequisites**: User has 100 notes
**Expected Result**: Response time < 200ms

---

#### TC-PERF-002: Password Hashing Time
**Description**: Password hashing should be reasonable
**Expected Result**: Hash time < 500ms per password

---

#### TC-PERF-003: Session Validation Time
**Description**: Session validation should be fast
**Expected Result**: Validation time < 50ms

---

## API Documentation Tests

#### TC-DOC-001: Swagger UI Accessible
**Description**: Swagger UI should be accessible
**Endpoint**: `GET /swagger`
**Expected Result**: HTML page with Swagger UI

---

#### TC-DOC-002: OpenAPI JSON Valid
**Description**: OpenAPI spec should be valid JSON
**Endpoint**: `GET /swagger/json`
**Expected Result**: Valid OpenAPI 3.0 JSON

---

#### TC-DOC-003: All Endpoints Documented
**Description**: All endpoints should appear in Swagger
**Expected Result**:
- All auth endpoints documented
- All note endpoints documented
- All system endpoints documented
- Each has descriptions, parameters, responses

---

## Edge Cases and Special Scenarios

#### TC-EDGE-001: Very Long Note Content
**Description**: System should handle large note content
**Test Data**: Note with 10,000 characters of content
**Expected Result**: Note created and retrieved successfully

---

#### TC-EDGE-002: Unicode in Content
**Description**: System should handle Unicode characters
**Test Data**:
```json
{
  "title": "Unicode Test 测试 🎉",
  "content": "Content with emoji 👍 and CJK characters 日本語"
}
```
**Expected Result**: Content stored and retrieved correctly

---

#### TC-EDGE-003: Special Characters in Email
**Description**: System should handle valid special chars in email
**Test Data**: `user+tag@example.co.uk`
**Expected Result**: Registration succeeds

---

#### TC-EDGE-004: Timestamp Accuracy
**Description**: Timestamps should be accurate
**Test Steps**:
1. Create note
2. Wait 2 seconds
3. Update note
4. Compare timestamps

**Expected Result**:
- `createdAt` remains unchanged
- `updatedAt` is updated and newer than `createdAt`

---

#### TC-EDGE-005: Whitespace Handling
**Description**: Test handling of whitespace in inputs
**Test Cases**:
- Title with leading/trailing spaces
- Content with multiple newlines
- Email with spaces (should be invalid)

---

## Health Check and System Tests

#### TC-SYS-001: Health Check Endpoint
**Description**: Health check should work without auth
**Endpoint**: `GET /health`
**Expected Result**:
```json
{
  "status": "healthy"
}
```

---

#### TC-SYS-002: Welcome Endpoint
**Description**: Root endpoint should work without auth
**Endpoint**: `GET /`
**Expected Result**:
```json
{
  "message": "Notes API is running"
}
```

---

#### TC-SYS-003: Environment Configuration
**Description**: Server should validate required env vars
**Test Steps**:
1. Start server without DATABASE_URL
2. Start server without SESSION_SECRET

**Expected Result**: Server throws error and doesn't start

---

## Test Data Setup

### Test Users
```javascript
const testUsers = {
  user1: {
    email: "user1@test.com",
    password: "TestPass123",
    name: "Test User 1"
  },
  user2: {
    email: "user2@test.com",
    password: "TestPass456",
    name: "Test User 2"
  },
  noName: {
    email: "noname@test.com",
    password: "TestPass789"
  }
};
```

### Test Notes
```javascript
const testNotes = {
  note1: {
    title: "First Note",
    content: "This is my first note"
  },
  note2: {
    title: "Second Note",
    content: "This is my second note"
  },
  longNote: {
    title: "Long Note",
    content: "Lorem ipsum...".repeat(100)
  }
};
```

---

## Test Execution Guidelines

### Setup Before Tests
1. Ensure PostgreSQL is running
2. Run `bunx prisma migrate dev` to setup test database
3. Clear database between test suites
4. Set `NODE_ENV=test`

### Teardown After Tests
1. Delete all test users
2. Clean up sessions
3. Reset database to clean state

### Test Environment Variables
```env
DATABASE_URL="postgresql://test:test@localhost:5432/notes_test"
SESSION_SECRET="test-secret-key-minimum-32-chars-long"
SESSION_MAX_AGE=604800000
PORT=3001
NODE_ENV=test
FRONTEND_URL="http://localhost:5173"
```

### Running Tests
```bash
# Run all tests
bun test

# Run specific test suite
bun test auth
bun test notes
bun test security

# Run with coverage
bun test --coverage
```

---

## Coverage Goals

- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 90%
- **Statement Coverage**: > 90%

### Critical Paths (100% Coverage Required)
- Authentication flow
- Authorization checks
- Password hashing/verification
- Session validation
- Ownership validation for notes

---

## Notes for Test Implementation

1. **Use Test Fixtures**: Create reusable test data and helper functions
2. **Isolate Tests**: Each test should be independent
3. **Clean State**: Reset database between tests
4. **Mock External Services**: If any external services are added
5. **Test Error Paths**: Don't just test happy paths
6. **Use Meaningful Assertions**: Check specific values, not just truthy/falsy
7. **Test Security**: Especially authentication and authorization
8. **Performance Benchmarks**: Set and track performance baselines
