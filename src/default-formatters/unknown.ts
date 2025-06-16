import { ErrorMessage } from "../formatter";

export function formatUnknownError(exception: any): ErrorMessage[] {
  const path =
    typeof exception?.name === "string"
      ? exception.name.toLowerCase()
      : "internal";

  return [
    {
      path,
      message: exception?.message || "An unexpected error occurred.",
    },
  ];
}
