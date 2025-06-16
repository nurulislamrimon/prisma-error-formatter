import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ErrorMessage } from "../formatter";

export function formatInitializationError(
  _exception: PrismaClientInitializationError
): ErrorMessage[] {
  return [
    {
      path: "database",
      message: "Failed to connect to the database.",
    },
  ];
}
