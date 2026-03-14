import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "@prisma/client/runtime/library";
import { parseHttpException } from "./helpers/parse-http-exception";
import { parsePrismaError } from "./helpers/parse-prisma-errors";
import { parseValidationErrors, ValidationError } from "./helpers/parse-validation-errors";

export interface ErrorResponse {
  success: boolean;
  message: string;
  errorMessages: Array<{
    path: string;
    message: string;
  }>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.formatException(exception);

    this.logException(exception, request);

    const status = this.getStatus(exception);

    response.status(status).json(errorResponse);
  }

  private formatException(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.formatHttpException(exception);
    }

    if (this.isPrismaError(exception)) {
      return this.formatPrismaException(exception);
    }

    if (this.isValidationError(exception)) {
      return this.formatValidationException(exception);
    }

    return this.formatGenericError(exception);
  }

  private formatHttpException(exception: HttpException): ErrorResponse {
    const parsed = parseHttpException(exception);
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message: string;
    if (typeof response === "object" && response !== null) {
      const res = response as Record<string, unknown>;
      message = typeof res.error === "string"
        ? res.error
        : this.getDefaultMessageForStatus(status);
    } else {
      message = exception.message || this.getDefaultMessageForStatus(status);
    }

    return {
      success: false,
      message,
      errorMessages: parsed,
    };
  }

  private formatPrismaException(
    exception: unknown
  ): ErrorResponse {
    if (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientInitializationError
    ) {
      const parsed = parsePrismaError(exception);

      let message: string;
      if (exception instanceof PrismaClientKnownRequestError) {
        switch (exception.code) {
          case "P2002":
            message = "Unique constraint failed";
            break;
          case "P2025":
            message = "Record not found";
            break;
          default:
            message = "Database error occurred";
        }
      } else if (exception instanceof PrismaClientValidationError) {
        message = "Invalid data provided";
      } else {
        message = "Database connection failed";
      }

      return {
        success: false,
        message,
        errorMessages: parsed.length > 0 ? parsed : [{ path: "database", message }],
      };
    }

    return {
      success: false,
      message: "Database error occurred",
      errorMessages: [{ path: "database", message: "Database error occurred" }],
    };
  }

  private formatValidationException(exception: any): ErrorResponse {
    const response = exception.getResponse();
    const messages: Array<{ path: string; message: string }> = [];

    if (typeof response === "object" && response !== null) {
      const res = response as Record<string, unknown>;
      if (Array.isArray(res.message)) {
        const validationErrors = res.message as unknown[];
        for (const error of validationErrors) {
          if (typeof error === "object" && error !== null) {
            const errorObj = error as Record<string, unknown>;
            if (errorObj.errors && Array.isArray(errorObj.errors)) {
              const parsed = parseValidationErrors(errorObj.errors as ValidationError[]);
              messages.push(...parsed);
            }
          }
        }
      }
    }

    if (messages.length === 0) {
      messages.push({ path: "validation", message: "Validation failed" });
    }

    return {
      success: false,
      message: "Validation failed",
      errorMessages: messages,
    };
  }

  private formatGenericError(exception: unknown): ErrorResponse {
    if (exception instanceof Error) {
      return {
        success: false,
        message: exception.message || "Internal server error",
        errorMessages: [
          {
            path: "server",
            message: exception.message || "Internal server error",
          },
        ],
      };
    }

    return {
      success: false,
      message: "Internal server error",
      errorMessages: [
        {
          path: "server",
          message: "Internal server error",
        },
      ],
    };
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientInitializationError
    );
  }

  private isValidationError(exception: unknown): boolean {
    if (!(exception instanceof HttpException)) return false;
    const response = exception.getResponse();
    if (typeof response !== "object" || response === null) return false;
    const res = response as Record<string, unknown>;
    return (
      exception.getStatus() === HttpStatus.BAD_REQUEST &&
      Array.isArray(res.message)
    );
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (this.isPrismaError(exception)) {
      return HttpStatus.BAD_REQUEST;
    }
    if (this.isValidationError(exception)) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "Bad request";
      case HttpStatus.UNAUTHORIZED:
        return "Unauthorized";
      case HttpStatus.FORBIDDEN:
        return "Forbidden";
      case HttpStatus.NOT_FOUND:
        return "Resource not found";
      case HttpStatus.CONFLICT:
        return "Conflict";
      default:
        return "Internal server error";
    }
  }

  private logException(exception: unknown, request: Request): void {
    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.headers["x-forwarded-for"] || "unknown";

    if (exception instanceof Error) {
      this.logger.error(
        `${method} ${url} - ${ip} - ${exception.message}`,
        exception.stack
      );
    } else {
      this.logger.error(
        `${method} ${url} - ${ip} - ${JSON.stringify(exception)}`
      );
    }
  }
}
