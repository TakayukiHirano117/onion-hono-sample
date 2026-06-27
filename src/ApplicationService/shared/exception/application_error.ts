export enum ApplicationErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
}

export abstract class ApplicationError extends Error {
  abstract readonly code: ApplicationErrorCode;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApplicationError {
  readonly code = ApplicationErrorCode.BAD_REQUEST;
}

export class UnauthorizedError extends ApplicationError {
  readonly code = ApplicationErrorCode.UNAUTHORIZED;
}

export class NotFoundError extends ApplicationError {
  readonly code = ApplicationErrorCode.NOT_FOUND;
}

export class ConflictError extends ApplicationError {
  readonly code = ApplicationErrorCode.CONFLICT;
}
