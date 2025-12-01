import { t } from "elysia";

// Request schemas
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

// Response schemas
export const noteSchema = t.Object({
  id: t.String({
    description: "Note ID (UUID)",
    examples: ["550e8400-e29b-41d4-a716-446655440000"],
  }),
  title: t.String({
    description: "Note title",
    examples: ["My First Note"],
  }),
  content: t.String({
    description: "Note content",
    examples: ["This is the content of my note..."],
  }),
  userId: t.String({
    description: "User ID who owns the note",
    examples: ["550e8400-e29b-41d4-a716-446655440000"],
  }),
  createdAt: t.Date({
    description: "Note creation timestamp",
  }),
  updatedAt: t.Date({
    description: "Note last update timestamp",
  }),
});

export const noteResponseSchema = t.Object({
  note: noteSchema,
});

export const notesListResponseSchema = t.Object({
  notes: t.Array(noteSchema),
});

// Error response schemas
export const errorResponseSchema = t.Object({
  error: t.String({
    description: "Error message",
    examples: ["Unauthorized - no valid session"],
  }),
});

export const validationErrorResponseSchema = t.Object({
  error: t.String({
    description: "Validation error details",
    examples: ["Invalid input data"],
  }),
});
