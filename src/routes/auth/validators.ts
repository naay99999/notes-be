import { t } from "elysia";

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
