import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { helmet } from "elysia-helmet";
import { rateLimit } from "elysia-rate-limit";
import { config } from "./config/env";
import { errorHandler } from "./middleware/error";
import { authRoutes } from "./routes/auth";
import { noteRoutes } from "./routes/notes";
import { SessionService } from "./services/session.service";

const app = new Elysia()
  // Swagger documentation
  .use(
    swagger({
      documentation: {
        info: {
          title: "Notes API Documentation",
          version: "1.0.0",
          description: "A simple notes API with session-based authentication",
        },
        tags: [
          { name: "Authentication", description: "User authentication endpoints" },
          { name: "Notes", description: "Notes management endpoints" },
          { name: "System", description: "System health and status endpoints" },
        ],
        components: {
          securitySchemes: {
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "sessionId",
              description: "Session ID stored in httpOnly cookie",
            },
          },
        },
      },
    })
  )

  // Security middleware
  .use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(helmet())
  .use(
    rateLimit({
      duration: 60000, // 1 minute
      max: 100, // 100 requests per minute
    })
  )

  // Error handling
  .use(errorHandler)

  // Health check
  .get("/", () => ({ message: "Notes API is running" }), {
    detail: {
      tags: ["System"],
      summary: "Welcome message",
      description: "Returns a welcome message indicating the API is running",
    },
  })
  .get("/health", () => ({ status: "healthy" }), {
    detail: {
      tags: ["System"],
      summary: "Health check",
      description: "Check if the API is healthy and running",
    },
  })

  // Routes
  .group("/api", (app) => app.use(authRoutes).use(noteRoutes))

  .listen(config.port);

// Cleanup expired sessions every hour
setInterval(() => {
  SessionService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
