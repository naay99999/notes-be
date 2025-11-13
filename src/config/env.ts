export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  sessionSecret: process.env.SESSION_SECRET!,
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || "604800000"), // 7 days in milliseconds
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
} as const;

// Validate required environment variables
if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!config.sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}
