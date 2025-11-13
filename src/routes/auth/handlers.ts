import { AuthService } from "../../services/auth.service";
import { SessionService } from "../../services/session.service";
import { config } from "../../config/env";

export const authHandlers = {
  async register({ body, cookie: { sessionId }, set }: any) {
    const user = await AuthService.register(body.email, body.password, body.name);

    // Create session
    const sessionIdValue = await SessionService.createSession(user.id);

    // Set cookie
    sessionId.set({
      value: sessionIdValue,
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax" as const,
      maxAge: config.sessionMaxAge / 1000, // Convert to seconds
      path: "/",
    });

    set.status = 201;
    return { user };
  },

  async login({ body, cookie: { sessionId }, set }: any) {
    const user = await AuthService.login(body.email, body.password);

    // Create session
    const sessionIdValue = await SessionService.createSession(user.id);

    // Set cookie
    sessionId.set({
      value: sessionIdValue,
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax" as const,
      maxAge: config.sessionMaxAge / 1000,
      path: "/",
    });

    return { user };
  },

  async logout({ cookie: { sessionId } }: any) {
    if (sessionId?.value) {
      await SessionService.deleteSession(sessionId.value);
      sessionId.remove();
    }

    return { message: "Logged out successfully" };
  },

  async me({ user, set }: any) {
    if (!user) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const { password: _pw, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  },
};
