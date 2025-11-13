import { t } from "elysia";

export const createNoteSchema = t.Object(
  {
    title: t.String({
      minLength: 1,
      maxLength: 255,
      description: "Note title (1-255 characters)",
      examples: ["My First Note"],
    }),
    content: t.String({
      description: "Note content (supports markdown)",
      examples: ["This is the content of my note..."],
    }),
  },
  {
    description: "Data for creating a new note",
  }
);

export const updateNoteSchema = t.Object(
  {
    title: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 255,
        description: "Updated note title (1-255 characters)",
        examples: ["Updated Title"],
      })
    ),
    content: t.Optional(
      t.String({
        description: "Updated note content",
        examples: ["Updated content..."],
      })
    ),
  },
  {
    description: "Data for updating an existing note (all fields optional)",
  }
);

export const noteParamsSchema = t.Object(
  {
    id: t.String({
      description: "Note ID (UUID)",
      examples: ["550e8400-e29b-41d4-a716-446655440000"],
    }),
  },
  {
    description: "Note ID parameter",
  }
);
