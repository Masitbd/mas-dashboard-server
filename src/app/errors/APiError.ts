class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      try {
        this.stack = stack;
      } catch {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
}

export default AppError;
