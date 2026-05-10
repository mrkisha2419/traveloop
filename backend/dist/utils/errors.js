export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = "APP_ERROR", details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
export const notFound = (resource = "Resource") => new AppError(`${resource} not found`, 404, "NOT_FOUND");
