import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ErrorMessage } from "../formatter";

export function formatKnownError(
  exception: PrismaClientKnownRequestError
): ErrorMessage[] {
  const messages: ErrorMessage[] = [];

  switch (exception.code) {
    case "P2002":
      const target = Array.isArray(exception.meta?.target)
        ? exception.meta?.target[0]
        : "unknown_field";
      messages.push({
        path: target,
        message: `A record with this ${target} already exists.`,
      });
      break;
    case "P2003":
      messages.push({
        path: (exception.meta?.field_name as string) || "unknown_relation",
        message: `Invalid reference: ${exception.meta?.field_name}.`,
      });
      break;
    case "P2005":
    case "P2006":
      messages.push({
        path: (exception.meta?.field_name as string) || "unknown_field",
        message: `Invalid value for ${exception.meta?.field_name}.`,
      });
      break;
    case "P2025":
      messages.push({
        path: (exception.meta?.model_name as string) || "resource",
        message: `The requested ${exception.meta?.model_name} does not exist.`,
      });
      break;
    default:
      messages.push({
        path: "unknown_error",
        message: exception.message || "Unknown Prisma error.",
      });
  }

  return messages;
}
