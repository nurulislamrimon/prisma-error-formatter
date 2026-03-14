import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

export interface HttpErrorResponse {
  success: boolean;
  message: string;
  errorMessages: Array<{
    path: string;
    message: string;
  }>;
}

export interface ParsedHttpError {
  path: string;
  message: string;
}

export function parseHttpException(exception: HttpException): ParsedHttpError[] {
  const response = exception.getResponse();
  const status = exception.getStatus();
  const message = exception.message;

  if (typeof response === "string") {
    return [
      {
        path: getPathForStatus(status),
        message: response || message,
      },
    ];
  }

  if (typeof response === "object" && response !== null) {
    const res = response as Record<string, unknown>;

    if (Array.isArray(res.message)) {
      return res.message.map((msg: unknown) => {
        if (typeof msg === "string") {
          return {
            path: (res.path as string) || getPathForStatus(status),
            message: msg,
          };
        }
        if (typeof msg === "object" && msg !== null) {
          const msgObj = msg as Record<string, unknown>;
          return {
            path: (msgObj.path as string) || (msgObj.property as string) || getPathForStatus(status),
            message: (msgObj.message as string) || JSON.stringify(msg),
          };
        }
        return {
          path: getPathForStatus(status),
          message: String(msg),
        };
      });
    }

    if (res.message && typeof res.message === "string") {
      return [
        {
          path: (res.path as string) || getPathForStatus(status),
          message: res.message,
        },
      ];
    }

    if (res.error && typeof res.error === "string") {
      return [
        {
          path: getPathForStatus(status),
          message: res.error,
        },
      ];
    }
  }

  return [
    {
      path: getPathForStatus(status),
      message: message || "HTTP error occurred",
    },
  ];
}

function getPathForStatus(status: number): string {
  switch (status) {
    case 400:
      return "request";
    case 401:
      return "authentication";
    case 403:
      return "authorization";
    case 404:
      return "resource";
    case 409:
      return "conflict";
    default:
      return "request";
  }
}

export function isNestJsHttpException(exception: unknown): boolean {
  return exception instanceof HttpException;
}

export function getExceptionType(exception: unknown): string {
  if (exception instanceof BadRequestException) return "BadRequestException";
  if (exception instanceof UnauthorizedException) return "UnauthorizedException";
  if (exception instanceof ForbiddenException) return "ForbiddenException";
  if (exception instanceof NotFoundException) return "NotFoundException";
  if (exception instanceof ConflictException) return "ConflictException";
  if (exception instanceof HttpException) return "HttpException";
  return "Unknown";
}
