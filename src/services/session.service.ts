import { prisma } from "../db";
import { config } from "../config/env";

export class SessionService {
  static async createSession(userId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + config.sessionMaxAge);

    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });

    return session.id;
  }

  static async validateSession(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) return null;

    // Check if expired
    if (session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return { session, user: session.user };
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await prisma.session
      .delete({
        where: { id: sessionId },
      })
      .catch(() => {});
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
