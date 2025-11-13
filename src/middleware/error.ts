import { Elysia } from "elysia";

export const errorHandler = new Elysia().onError(({ code, error, set }) => {
  console.error("Error:", error);

  // Handle validation errors
  if (code === "VALIDATION") {
    set.status = 400;
    return {
      error: "Validation error",
      message: error.message,
    };
  }

  // Handle not found
  if (code === "NOT_FOUND") {
    set.status = 404;
    return {
      error: "Not found",
      message: "The requested resource was not found",
    };
  }

  // Handle custom errors
  if (error.message === "Unauthorized") {
    set.status = 401;
    return {
      error: "Unauthorized",
      message: "You must be logged in to access this resource",
    };
  }

  if (error.message === "User already exists") {
    set.status = 409;
    return {
      error: "Conflict",
      message: error.message,
    };
  }

  if (error.message === "Invalid credentials") {
    set.status = 401;
    return {
      error: "Unauthorized",
      message: error.message,
    };
  }

  if (error.message === "Note not found") {
    set.status = 404;
    return {
      error: "Not found",
      message: error.message,
    };
  }

  // Handle internal server errors
  set.status = 500;
  return {
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  };
});
