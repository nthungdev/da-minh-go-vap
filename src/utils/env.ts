/**
 * Environment variable validation schema and utilities.
 * Validates required server and client environment variables at build/runtime
 * to prevent misconfigured deployments.
 */

interface EnvRule {
  name: string;
  required?: boolean;
  type?: "string" | "url" | "email";
  description?: string;
  validate?: (value: string | undefined) => string | null;
}

const REQUIRED_SERVER_VARS: EnvRule[] = [
  {
    name: "PAYLOAD_SECRET",
    required: true,
    description: "Secret key for Payload CMS sessions and JWT encryption",
  },
  {
    name: "DATABASE_URI",
    required: true,
    description: "MongoDB connection URI (e.g. mongodb://user:pass@host:port/db)",
    validate: (val) => {
      if (val && !val.startsWith("mongodb://") && !val.startsWith("mongodb+srv://")) {
        return "Must start with mongodb:// or mongodb+srv://";
      }
      return null;
    },
  },
  {
    name: "PAYLOAD_ADMIN_EMAIL",
    required: true,
    type: "email",
    description: "Initial administrator email address for Payload CMS",
    validate: (val) => {
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return "Must be a valid email address";
      }
      return null;
    },
  },
  {
    name: "PAYLOAD_ADMIN_PASSWORD",
    required: true,
    description: "Initial administrator password for Payload CMS",
    validate: (val) => {
      if (val && val.length < 4) {
        return "Must be at least 4 characters long";
      }
      return null;
    },
  },
  {
    name: "AUTH_USER",
    required: true,
    description: "HTTP Basic Auth username for restricted pages",
  },
  {
    name: "AUTH_PASSWORD",
    required: true,
    description: "HTTP Basic Auth password for restricted pages",
  },
];

const CONDITIONAL_VARS: EnvRule[] = [
  {
    name: "S3_ACCESS_KEY_ID",
    description: "S3 / Cloudflare R2 access key ID (required when S3_BUCKET is provided)",
    validate: (val) => {
      if (process.env.S3_BUCKET && !val) {
        return "Required when S3_BUCKET is set";
      }
      return null;
    },
  },
  {
    name: "S3_SECRET",
    description: "S3 / Cloudflare R2 secret access key (required when S3_BUCKET is provided)",
    validate: (val) => {
      if (process.env.S3_BUCKET && !val) {
        return "Required when S3_BUCKET is set";
      }
      return null;
    },
  },
  {
    name: "S3_ENDPOINT",
    description: "S3 / Cloudflare R2 endpoint URL (required when S3_BUCKET is provided)",
    validate: (val) => {
      if (process.env.S3_BUCKET && !val) {
        return "Required when S3_BUCKET is set";
      }
      return null;
    },
  },
];

export interface EnvValidationResult {
  isValid: boolean;
  errors: Array<{ name: string; error: string; description?: string }>;
}

/**
 * Validates required environment variables according to configuration rules.
 *
 * @param env - Optional environment object to validate (defaults to `process.env`)
 * @returns Object indicating whether validation passed, with detailed error list.
 */
export function validateEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): EnvValidationResult {
  const errors: Array<{ name: string; error: string; description?: string }> = [];

  const allRules = [...REQUIRED_SERVER_VARS, ...CONDITIONAL_VARS];

  for (const rule of allRules) {
    const value = env[rule.name];

    if (rule.required && (!value || value.trim() === "")) {
      errors.push({
        name: rule.name,
        error: "Missing required environment variable",
        description: rule.description,
      });
      continue;
    }

    if (rule.validate) {
      const customError = rule.validate(value);
      if (customError) {
        errors.push({
          name: rule.name,
          error: customError,
          description: rule.description,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates environment variables at build or startup time.
 * If validation fails and `SKIP_ENV_VALIDATION` is not set, prints a descriptive
 * error summary and throws an Error to halt the build process.
 */
export function assertValidEnvironment(): void {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    console.warn("⚠️  Skipping build-time environment variable validation (SKIP_ENV_VALIDATION=true).");
    return;
  }

  const { isValid, errors } = validateEnvironment();

  if (!isValid) {
    const errorDetails = errors
      .map(
        (err) =>
          `  - \x1b[31m${err.name}\x1b[0m: ${err.error}${
            err.description ? ` (${err.description})` : ""
          }`,
      )
      .join("\n");

    const message = [
      "",
      "\x1b[1m\x1b[31m❌ Environment Variable Validation Failed!\x1b[0m",
      "The following required environment variables are missing or invalid:",
      errorDetails,
      "",
      "Please ensure these variables are defined in your .env / deployment environment.",
      "To skip validation temporarily during development, set SKIP_ENV_VALIDATION=true.",
      "",
    ].join("\n");

    console.error(message);
    throw new Error(
      `Build failed due to ${errors.length} missing or invalid environment variable(s).`,
    );
  }
}
