import { NoteService } from "../../services/note.service";

export const noteHandlers = {
  async create({ body, user, set }: any) {
    const note = await NoteService.createNote(user.id, body.title, body.content);

    set.status = 201;
    return { note };
  },

  async getAll({ user }: any) {
    const notes = await NoteService.getNotes(user.id);
    return { notes };
  },

  async getOne({ params, user }: any) {
    const note = await NoteService.getNoteById(params.id, user.id);
    return { note };
  },

  async update({ params, body, user }: any) {
    const note = await NoteService.updateNote(params.id, user.id, body);
    return { note };
  },

  async delete({ params, user, set }: any) {
    await NoteService.deleteNote(params.id, user.id);
    set.status = 204;
  },
};
