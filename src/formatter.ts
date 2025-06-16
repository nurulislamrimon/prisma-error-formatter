import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from "@prisma/client/runtime/library";

import {
  formatKnownError,
  formatValidationError,
  formatInitializationError,
  formatUnknownError,
} from "./default-formatters";

export interface ErrorMessage {
  path: string;
  message: string;
}

export type FormatFunction = (info: {
  type: "known" | "validation" | "initialization" | "panic" | "unknown";
  error: any;
  default: ErrorMessage[];
}) => any[];

interface FormatterOptions {
  format?: FormatFunction;
}

export class PrismaExceptionFormatter {
  private readonly customFormat?: FormatFunction;

  constructor(options?: FormatterOptions) {
    this.customFormat = options?.format;
  }

  private applyFormat(
    type: "known" | "validation" | "initialization" | "panic" | "unknown",
    error: any,
    defaults: ErrorMessage[]
  ): any[] {
    return this.customFormat
      ? this.customFormat({ type, error, default: defaults })
      : defaults;
  }

  formatPrismaError(exception: PrismaClientKnownRequestError): any[] {
    const defaults = formatKnownError(exception);
    return this.applyFormat("known", exception, defaults);
  }

  formatQueryError(
    exception: PrismaClientValidationError | PrismaClientRustPanicError
  ): any[] {
    const defaults = formatValidationError(exception);
    return this.applyFormat("validation", exception, defaults);
  }

  formatInitializationError(exception: PrismaClientInitializationError): any[] {
    const defaults = formatInitializationError(exception);
    return this.applyFormat("initialization", exception, defaults);
  }

  formatUnknownError(exception: any): any[] {
    const defaults = formatUnknownError(exception);
    return this.applyFormat("unknown", exception, defaults);
  }

  formatError(exception: any): any[] {
    if (exception instanceof PrismaClientKnownRequestError) {
      return this.formatPrismaError(exception);
    } else if (
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientRustPanicError
    ) {
      return this.formatQueryError(exception);
    } else if (exception instanceof PrismaClientInitializationError) {
      return this.formatInitializationError(exception);
    } else {
      return this.formatUnknownError(exception);
    }
  }
}
