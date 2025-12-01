// Notes related types

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

export interface NoteParams {
  id: string;
}

// Response types
export interface NoteResponse {
  note: Note;
}

export interface NotesListResponse {
  notes: Note[];
}

export interface CreateNoteResponse {
  note: Note;
}

export interface UpdateNoteResponse {
  note: Note;
}

export interface DeleteNoteResponse {
  // No content for successful deletion (204)
}