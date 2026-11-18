import assert from "node:assert/strict";
import test from "node:test";

const { validateEnvironment } = await import("../src/utils/env.ts");

const VALID_ENV: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  PAYLOAD_SECRET: "secret",
  DATABASE_URI: "mongodb://localhost:27017/db",
  PAYLOAD_ADMIN_EMAIL: "admin@example.com",
  PAYLOAD_ADMIN_PASSWORD: "admin",
  AUTH_USER: "user",
  AUTH_PASSWORD: "password",
};

function failingNames(env: NodeJS.ProcessEnv): string[] {
  return validateEnvironment(env).errors.map((err) => err.name);
}

test("passes with only the required vars", () => {
  assert.deepEqual(failingNames(VALID_ENV), []);
});

test("S3 rules read S3_BUCKET from the passed env, not process.env", () => {
  delete process.env.S3_BUCKET;
  assert.deepEqual(failingNames({ ...VALID_ENV, S3_BUCKET: "bucket" }), [
    "S3_ACCESS_KEY_ID",
    "S3_SECRET",
    "S3_ENDPOINT",
  ]);

  process.env.S3_BUCKET = "bucket";
  try {
    assert.deepEqual(failingNames(VALID_ENV), []);
  } finally {
    delete process.env.S3_BUCKET;
  }
});

test("public URL vars are optional but must be http(s) URLs when set", () => {
  assert.deepEqual(
    failingNames({
      ...VALID_ENV,
      NEXT_PUBLIC_BASE_URL: "dongdaminhgovap.org",
      NEXT_PUBLIC_MEDIA_CDN_URL: "ftp://cdn.example.test",
    }),
    ["NEXT_PUBLIC_BASE_URL", "NEXT_PUBLIC_MEDIA_CDN_URL"],
  );
  assert.deepEqual(
    failingNames({
      ...VALID_ENV,
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      NEXT_PUBLIC_MEDIA_CDN_URL: "https://cdn.example.test",
    }),
    [],
  );
});

test("Firebase config is required only when analytics is enabled", () => {
  assert.deepEqual(
    failingNames({
      ...VALID_ENV,
      NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED: "false",
    }),
    [],
  );
  assert.deepEqual(
    failingNames({
      ...VALID_ENV,
      NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_FIREBASE_API_KEY: "key",
    }),
    [
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    ],
  );
});
