# prisma-error-formatter

[![npm version](https://img.shields.io/npm/v/prisma-error-formatter.svg)](https://www.npmjs.com/package/prisma-error-formatter)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible and customizable **Prisma** error formatter to simplify and unify error handling in Prisma Client applications. Easily transform Prisma errors into user-friendly, consistent error messages for your APIs or UI.

---

## Features

- Formats common Prisma Client errors like unique constraint violations, foreign key errors, validation errors, and initialization errors.
- Supports custom error formatting via a callback function.
- Works with Prisma Client’s error classes:
  - `PrismaClientKnownRequestError`
  - `PrismaClientValidationError`
  - `PrismaClientInitializationError`
  - `PrismaClientRustPanicError`
- Returns structured error messages with clear `path` and `message` fields.
- Written in TypeScript with full typings.

---

## Installation

```bash
npm install prisma-error-formatter @prisma/client
```

---

## Basic Usage

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaExceptionFormatter } from "prisma-error-formatter";

const prisma = new PrismaClient();
const formatter = new PrismaExceptionFormatter();

async function createUser(email: string) {
  try {
    await prisma.user.create({ data: { email } });
  } catch (error) {
    const formattedErrors = formatter.formatError(error);
    console.error(formattedErrors);
    /*
      Example output:
      [
        {
          path: "email",
          message: "A record with this email already exists."
        }
      ]
    */
  }
}
```

---

## Using a Custom Formatter

You can provide your own formatting logic by passing a `format` function when creating the formatter instance:

```ts
import { PrismaExceptionFormatter, ErrorMessage } from "prisma-error-formatter";

const formatter = new PrismaExceptionFormatter({
  format: ({ type, error, defaults }) => {
    // Add extra info or change messages based on error type
    if (type === "known" && error.code === "P2002") {
      return [
        {
          path: defaults[0].path,
          message: `Custom: Duplicate value found for ${defaults[0].path}`,
        },
      ];
    }
    // Fallback to default formatting
    return defaults;
  },
});
```

---

## API

### `new PrismaExceptionFormatter(options?: { format?: FormatFunction })`

Creates a new formatter instance.

- `options.format` - Optional custom format function. Receives an object with:
  - `type`: The error type (`known`, `validation`, `initialization`, `panic`, `unknown`)
  - `error`: The original error object
  - `defaults`: The default formatted error messages (array of `{ path, message }`)

Returns formatted errors as an array.

### Methods

- `formatError(exception: any): ErrorMessage[]`  
  Automatically detects the Prisma error type and returns formatted messages.

- `formatPrismaError(exception: PrismaClientKnownRequestError): ErrorMessage[]`  
  Formats known Prisma client errors.

- `formatQueryError(exception: PrismaClientValidationError | PrismaClientRustPanicError): ErrorMessage[]`  
  Formats validation or panic errors.

- `formatInitializationError(exception: PrismaClientInitializationError): ErrorMessage[]`  
  Formats database initialization errors.

- `formatUnknownError(exception: any): ErrorMessage[]`  
  Formats unknown errors.

---

## Supported Prisma Error Codes (Known Errors)

- `P2002` - Unique constraint violation
- `P2003` - Foreign key constraint failure
- `P2005`, `P2006` - Invalid value errors
- `P2025` - Record not found

---

## License

MIT © Nurul Islam Rimon

---

## Contribution

Contributions, issues, and feature requests are welcome! Feel free to check

[project page](https://github.com/nurulislamrimon/prisma-error-formatter)

[issues page](https://github.com/nurulislamrimon/prisma-error-formatter/issues)

---

## Related

- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma Error Codes](https://www.prisma.io/docs/reference/api-reference/error-reference)

---

_Built with ❤️ by Nurul Islam Rimon_

---

### 🛠️ Open Source Contribution

This project is open to all contributors! Whether you're fixing bugs, improving documentation, adding new formatters, or suggesting ideas — your contribution is highly appreciated.

#### How to Contribute

1. **Fork** this repository
2. Create your **feature branch**:
   ```bash
   git checkout -b feat/my-awesome-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add my awesome feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feat/my-awesome-feature
   ```
5. **Open a pull request**

### 🙌 Contributions Welcome!

- 📖 Improve the documentation
- 🧪 Add unit tests
- 🔍 Add support for more Prisma error codes
- 💡 Propose new formatting strategies or ideas
