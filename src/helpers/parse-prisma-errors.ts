import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "@prisma/client/runtime/library";

export interface ParsedPrismaError {
  path: string;
  message: string;
}

export function parsePrismaError(exception: unknown): ParsedPrismaError[] {
  if (exception instanceof PrismaClientKnownRequestError) {
    return parseKnownRequestError(exception);
  }

  if (exception instanceof PrismaClientValidationError) {
    return parseValidationError(exception);
  }

  if (exception instanceof PrismaClientInitializationError) {
    return parseInitializationError(exception);
  }

  return [];
}

function parseKnownRequestError(
  exception: PrismaClientKnownRequestError
): ParsedPrismaError[] {
  const code = exception.code;
  const meta = exception.meta as Record<string, unknown> | undefined;

  switch (code) {
    case "P2002": {
      const target = Array.isArray(meta?.target)
        ? meta.target[0]
        : (meta?.target as string) || "field";
      return [
        {
          path: target,
          message: "Unique constraint failed",
        },
      ];
    }

    case "P2025": {
      return [
        {
          path: (meta?.model_name as string) || "record",
          message: "Record not found",
        },
      ];
    }

    case "P2003": {
      return [
        {
          path: (meta?.field_name as string) || "relation",
          message: "Foreign key constraint failed",
        },
      ];
    }

    case "P2000": {
      return [
        {
          path: (meta?.field_name as string) || "field",
          message: `Value too long for column ${meta?.field_name}`,
        },
      ];
    }

    case "P2001": {
      return [
        {
          path: (meta?.field_name as string) || "record",
          message: "Record does not exist",
        },
      ];
    }

    case "P2004": {
      return [
        {
          path: "database",
          message: "A constraint failed on the database",
        },
      ];
    }

    case "P2005": {
      return [
        {
          path: (meta?.field_name as string) || "field",
          message: `Invalid value for field ${meta?.field_name}`,
        },
      ];
    }

    case "P2006": {
      return [
        {
          path: (meta?.field_name as string) || "field",
          message: `Invalid value for field ${meta?.field_name}`,
        },
      ];
    }

    case "P2007": {
      return [
        {
          path: "database",
          message: "Database error",
        },
      ];
    }

    case "P2008": {
      return [
        {
          path: "query",
          message: "Failed to parse query",
        },
      ];
    }

    case "P2009": {
      return [
        {
          path: "query",
          message: "Failed to validate query",
        },
      ];
    }

    case "P2010": {
      return [
        {
          path: "query",
          message: "Raw query failed",
        },
      ];
    }

    case "P2011": {
      return [
        {
          path: "database",
          message: "Null constraint violation",
        },
      ];
    }

    case "P2012": {
      return [
        {
          path: "database",
          message: "Missing a required value",
        },
      ];
    }

    case "P2013": {
      return [
        {
          path: "relation",
          message: "Missing the required relation",
        },
      ];
    }

    case "P2014": {
      return [
        {
          path: "relation",
          message: "Relation would be violated",
        },
      ];
    }

    case "P2015": {
      return [
        {
          path: "query",
          message: "Related record not found",
        },
      ];
    }

    case "P2016": {
      return [
        {
          path: "query",
          message: "Query interpretation error",
        },
      ];
    }

    case "P2017": {
      return [
        {
          path: "relation",
          message: "Records are not connected",
        },
      ];
    }

    case "P2018": {
      return [
        {
          path: "relation",
          message: "Required connected records not found",
        },
      ];
    }

    case "P2019": {
      return [
        {
          path: "input",
          message: "Input error",
        },
      ];
    }

    case "P2020": {
      return [
        {
          path: "value",
          message: "Value out of range",
        },
      ];
    }

    case "P2021": {
      return [
        {
          path: "table",
          message: `Table ${meta?.table} does not exist in the current database`,
        },
      ];
    }

    case "P2022": {
      return [
        {
          path: "column",
          message: `Column ${meta?.column} does not exist`,
        },
      ];
    }

    case "P2023": {
      return [
        {
          path: "database",
          message: "Database schema inconsistent",
        },
      ];
    }

    case "P2024": {
      return [
        {
          path: "database",
          message: "Timed out fetching a new connection from the connection pool",
        },
      ];
    }

    case "P2025": {
      return [
        {
          path: (meta?.model_name as string) || "record",
          message: "Record not found",
        },
      ];
    }

    case "P2026": {
      return [
        {
          path: "database",
          message: "Current provider does not support this feature",
        },
      ];
    }

    case "P2027": {
      return [
        {
          path: "database",
          message: "Multiple database errors",
        },
      ];
    }

    default: {
      return [
        {
          path: "database",
          message: exception.message || "Database error occurred",
        },
      ];
    }
  }
}

function parseValidationError(
  exception: PrismaClientValidationError
): ParsedPrismaError[] {
  const message = exception.message;
  const match = message.match(/Argument `(\w+)` is missing/);

  if (match) {
    const field = match[1];
    return [
      {
        path: field,
        message: `Argument \`${field}\` is missing`,
      },
    ];
  }

  return [
    {
      path: "query",
      message: message || "Invalid query",
    },
  ];
}

function parseInitializationError(
  _exception: PrismaClientInitializationError
): ParsedPrismaError[] {
  return [
    {
      path: "database",
      message: "Failed to connect to the database",
    },
  ];
}
