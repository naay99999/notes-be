import { Elysia } from "elysia";
import { authHandlers } from "./handlers";
import { registerSchema, loginSchema } from "./validators";
import { authMiddleware } from "../../middleware/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", authHandlers.register, {
    body: registerSchema,
    detail: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description:
        "Create a new user account with email and password. Returns user data and sets session cookie.",
      responses: {
        201: {
          description: "User successfully registered",
        },
        409: {
          description: "User already exists",
        },
      },
    },
  })
  .post("/login", authHandlers.login, {
    body: loginSchema,
    detail: {
      tags: ["Authentication"],
      summary: "Login user",
      description:
        "Authenticate user with email and password. Returns user data and sets session cookie.",
      responses: {
        200: {
          description: "Login successful",
        },
        401: {
          description: "Invalid credentials",
        },
      },
    },
  })
  .post("/logout", authHandlers.logout, {
    detail: {
      tags: ["Authentication"],
      summary: "Logout user",
      description: "Logout current user by deleting session and clearing cookie.",
      responses: {
        200: {
          description: "Logout successful",
        },
      },
    },
  })
  .use(authMiddleware)
  .get("/me", authHandlers.me, {
    detail: {
      tags: ["Authentication"],
      summary: "Get current user",
      description: "Get the currently authenticated user's information.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Current user information",
        },
        401: {
          description: "Unauthorized - no valid session",
        },
      },
    },
  });
