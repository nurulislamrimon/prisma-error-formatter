import {
  PrismaClientValidationError,
  PrismaClientRustPanicError,
} from "@prisma/client/runtime/library";
import { ErrorMessage } from "../formatter";

export function formatValidationError(
  exception: PrismaClientValidationError | PrismaClientRustPanicError
): ErrorMessage[] {
  const raw = exception.message || "Invalid query or DB error.";
  const match = raw.match(/Argument `(\w+)` is missing/);
  const field = match?.[1] ?? "query";

  return [
    {
      path: field,
      message: match ? `Argument \`${field}\` is missing.` : raw,
    },
  ];
}
