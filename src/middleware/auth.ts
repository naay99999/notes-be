import { Elysia } from "elysia";
import { SessionService } from "../services/session.service";

export const authMiddleware = new Elysia().derive(
  async ({ cookie: { sessionId }, set }) => {
    if (!sessionId?.value) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const result = await SessionService.validateSession(sessionId.value);

    if (!result) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    return {
      user: result.user,
      session: result.session,
    };
  }
);
