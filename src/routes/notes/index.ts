import { Elysia } from "elysia";
import { noteHandlers } from "./handlers";
import {
  createNoteSchema,
  updateNoteSchema,
  noteParamsSchema,
} from "./validators";
import { SessionService } from "../../services/session.service";

export const noteRoutes = new Elysia({ prefix: "/notes" })
  .derive(async ({ cookie: { sessionId }, set }) => {
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
  })
  .post("/", noteHandlers.create, {
    body: createNoteSchema,
    detail: {
      tags: ["Notes"],
      summary: "Create a new note",
      description: "Create a new note for the authenticated user.",
      security: [{ cookieAuth: [] }],
      responses: {
        201: {
          description: "Note created successfully",
        },
        401: {
          description: "Unauthorized - no valid session",
        },
        400: {
          description: "Validation error - invalid input",
        },
      },
    },
  })
  .get("/", noteHandlers.getAll, {
    detail: {
      tags: ["Notes"],
      summary: "Get all notes",
      description: "Get all notes belonging to the authenticated user, sorted by most recently updated.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "List of notes",
        },
        401: {
          description: "Unauthorized - no valid session",
        },
      },
    },
  })
  .get("/:id", noteHandlers.getOne, {
    params: noteParamsSchema,
    detail: {
      tags: ["Notes"],
      summary: "Get a specific note",
      description: "Get a specific note by ID. User must own the note.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Note details",
        },
        401: {
          description: "Unauthorized - no valid session",
        },
        404: {
          description: "Note not found or not owned by user",
        },
      },
    },
  })
  .patch("/:id", noteHandlers.update, {
    params: noteParamsSchema,
    body: updateNoteSchema,
    detail: {
      tags: ["Notes"],
      summary: "Update a note",
      description: "Update an existing note. User must own the note. All fields are optional.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Note updated successfully",
        },
        401: {
          description: "Unauthorized - no valid session",
        },
        404: {
          description: "Note not found or not owned by user",
        },
        400: {
          description: "Validation error - invalid input",
        },
      },
    },
  })
  .delete("/:id", noteHandlers.delete, {
    params: noteParamsSchema,
    detail: {
      tags: ["Notes"],
      summary: "Delete a note",
      description: "Delete a note by ID. User must own the note.",
      security: [{ cookieAuth: [] }],
      responses: {
        204: {
          description: "Note deleted successfully",
        },
        401: {
          description: "Unauthorized - no valid session",
        },
        404: {
          description: "Note not found or not owned by user",
        },
      },
    },
  });
