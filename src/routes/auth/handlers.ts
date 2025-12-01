import { AuthService } from "../../services/auth.service";
import { SessionService } from "../../services/session.service";
import { config } from "../../config/env";
import type {
  User,
  AuthenticatedContext,
  AuthResponse,
  AuthenticatedUser
} from "../../types";

export const authHandlers = {
  async register({
    body,
    cookie: { sessionId },
    set
  }: {
    body: { email: string; password: string; name?: string };
    cookie: { sessionId: { set: (options: any) => void } };
    set: { status: (code: number) => void };
  }): Promise<AuthResponse> {
    const user = await AuthService.register(body.email, body.password, body.name);

    // Create session
    const sessionIdValue = await SessionService.createSession(user.id);

    // Set cookie
    const frontend = new URL(config.frontendUrl);
    const apiOrigin = `http://localhost:${config.port}`;
    const isCrossSite = frontend.origin !== apiOrigin;

    sessionId.set({
      value: sessionIdValue,
      httpOnly: true,
      // Use secure cookies in production and when cross-site to satisfy SameSite=None requirements
      secure: config.nodeEnv === "production" || isCrossSite,
      // Allow cross-site requests from a separate frontend origin during development
      sameSite: isCrossSite ? ("none" as const) : ("lax" as const),
      maxAge: config.sessionMaxAge / 1000, // Convert to seconds
      path: "/",
    });

    set.status = 201;
    return { user };
  },

  async login({
    body,
    cookie: { sessionId }
  }: {
    body: { email: string; password: string };
    cookie: { sessionId: { set: (options: any) => void } };
  }): Promise<AuthResponse> {
    const user = await AuthService.login(body.email, body.password);

    // Create session
    const sessionIdValue = await SessionService.createSession(user.id);

    // Set cookie
    const frontend = new URL(config.frontendUrl);
    const apiOrigin = `http://localhost:${config.port}`;
    const isCrossSite = frontend.origin !== apiOrigin;

    sessionId.set({
      value: sessionIdValue,
      httpOnly: true,
      secure: config.nodeEnv === "production" || isCrossSite,
      sameSite: isCrossSite ? ("none" as const) : ("lax" as const),
      maxAge: config.sessionMaxAge / 1000,
      path: "/",
    });

    return { user };
  },

  async logout({
    cookie: { sessionId }
  }: {
    cookie: { sessionId: { value?: string; remove: () => void } };
  }): Promise<{ message: string }> {
    if (sessionId?.value) {
      await SessionService.deleteSession(sessionId.value);
      sessionId.remove();
    }

    return { message: "Logged out successfully" };
  },

  async me({
    user
  }: {
    user: AuthenticatedContext['user'];
  }): Promise<AuthenticatedUser> {
    // Create user object without password field (Prisma already excludes password)
    const { password: _pw, ...userWithoutPassword } = user as any;
    return { user: userWithoutPassword };
  },
};
