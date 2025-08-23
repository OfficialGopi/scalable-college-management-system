import { Response } from "express";

class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: any[];
  public message: string;
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors = [],
    stack: string | undefined = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      // ============ Error.captureStackTrace(this, this.constructor) is called to generate a stack trace automatically ================
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ApiResponse {
  private statusCode: number;
  private data: any;
  private success: boolean;
  private message: string;

  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  send(res: Response) {
    return res.status(this.statusCode ?? 200).json({
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export { ApiError, ApiResponse };
