export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends ApiError {
  constructor() {
    super('Not found.', 404);
  }
}

export class InternalServerError extends ApiError {
  constructor() {
    super('Internal server error.', 500);
  }
}
