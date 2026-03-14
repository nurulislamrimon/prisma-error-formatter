export interface ValidationError {
  property: string;
  constraints?: Record<string, string>;
  children?: ValidationError[];
}

export interface ParsedValidationError {
  path: string;
  message: string;
}

export function parseValidationErrors(errors: ValidationError[]): ParsedValidationError[] {
  const result: ParsedValidationError[] = [];

  for (const error of errors) {
    if (error.constraints && Object.keys(error.constraints).length > 0) {
      const messages = Object.values(error.constraints).join(", ");
      result.push({
        path: error.property,
        message: messages,
      });
    }

    if (error.children && error.children.length > 0) {
      result.push(...parseValidationErrors(error.children));
    }
  }

  return result;
}
