import { prisma } from "../db";

export class NoteService {
  static async createNote(userId: string, title: string, content: string) {
    return await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
    });
  }

  static async getNotes(userId: string) {
    return await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getNoteById(id: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  }

  static async updateNote(
    id: string,
    userId: string,
    data: { title?: string; content?: string }
  ) {
    // Verify ownership
    await this.getNoteById(id, userId);

    return await prisma.note.update({
      where: { id },
      data,
    });
  }

  static async deleteNote(id: string, userId: string) {
    // Verify ownership
    await this.getNoteById(id, userId);

    await prisma.note.delete({
      where: { id },
    });
  }
}
