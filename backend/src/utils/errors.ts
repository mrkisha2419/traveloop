export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code = "APP_ERROR",
    public details?: unknown
  ) {
    super(message);
  }
}

export const notFound = (resource = "Resource") => new AppError(`${resource} not found`, 404, "NOT_FOUND");
