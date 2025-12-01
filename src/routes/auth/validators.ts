import { t } from "elysia";

// Request schemas
export const registerSchema = t.Object(
  {
    email: t.String({
      format: "email",
      description: "User email address",
      examples: ["user@example.com"],
    }),
    password: t.String({
      minLength: 8,
      description: "User password (minimum 8 characters)",
      examples: ["SecurePass123"],
    }),
    name: t.Optional(t.String({
      description: "User's full name (optional)",
      examples: ["John Doe"],
    })),
  },
  {
    description: "User registration data",
  }
);

export const loginSchema = t.Object(
  {
    email: t.String({
      format: "email",
      description: "User email address",
      examples: ["user@example.com"],
    }),
    password: t.String({
      description: "User password",
      examples: ["SecurePass123"],
    }),
  },
  {
    description: "User login credentials",
  }
);

// Response schemas
export const userSchema = t.Object({
  id: t.String({
    description: "User ID (UUID)",
    examples: ["550e8400-e29b-41d4-a716-446655440000"],
  }),
  email: t.String({
    description: "User email address",
    examples: ["user@example.com"],
  }),
  name: t.Optional(t.Union([
    t.String({
      description: "User's full name",
      examples: ["John Doe"],
    }),
    t.Null(),
  ])),
  createdAt: t.Date({
    description: "User creation timestamp",
  }),
  updatedAt: t.Date({
    description: "User last update timestamp",
  }),
});

export const authResponseSchema = t.Object({
  user: userSchema,
});

export const logoutResponseSchema = t.Object({
  message: t.String({
    description: "Logout confirmation message",
    examples: ["Logged out successfully"],
  }),
});

// Error response schemas
export const authErrorResponseSchema = t.Object({
  error: t.String({
    description: "Authentication error message",
    examples: ["Invalid credentials"],
  }),
});

export const validationErrorResponseSchema = t.Object({
  error: t.String({
    description: "Validation error details",
    examples: ["Invalid input data"],
  }),
});
