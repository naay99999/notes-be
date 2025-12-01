import { NoteService } from "../../services/note.service";
import type {
  AuthenticatedContext,
  CreateNoteResponse,
  NotesListResponse,
  NoteResponse,
  UpdateNoteResponse
} from "../../types";

export const noteHandlers = {
  async create({
    body,
    user,
    set
  }: {
    body: { title: string; content: string };
    user: AuthenticatedContext['user'];
    set: { status: (code: number) => void };
  }): Promise<CreateNoteResponse> {
    const note = await NoteService.createNote(user.id, body.title, body.content);

    set.status = 201;
    return { note };
  },

  async getAll({
    user
  }: {
    user: AuthenticatedContext['user'];
  }): Promise<NotesListResponse> {
    const notes = await NoteService.getNotes(user.id);
    return { notes };
  },

  async getOne({
    params,
    user
  }: {
    params: { id: string };
    user: AuthenticatedContext['user'];
  }): Promise<NoteResponse> {
    const note = await NoteService.getNoteById(params.id, user.id);
    return { note };
  },

  async update({
    params,
    body,
    user
  }: {
    params: { id: string };
    body: { title?: string; content?: string };
    user: AuthenticatedContext['user'];
  }): Promise<UpdateNoteResponse> {
    const note = await NoteService.updateNote(params.id, user.id, body);
    return { note };
  },

  async delete({
    params,
    user,
    set
  }: {
    params: { id: string };
    user: AuthenticatedContext['user'];
    set: { status: (code: number) => void };
  }): Promise<void> {
    await NoteService.deleteNote(params.id, user.id);
    set.status = 204;
  },
};
