import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const TOKENS_PATH = path.resolve("design/tokens.json");

type TokenNode = {
  $value?: unknown;
  $type?: string;
  [key: string]: unknown;
};

function assertValidW3CTokenTree(node: TokenNode, trail: string): void {
  if ("$value" in node) {
    assert.ok(
      typeof node.$type === "string" && node.$type.length > 0,
      `Token at ${trail} must have a non-empty $type`,
    );
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    assert.ok(
      child && typeof child === "object" && !Array.isArray(child),
      `Group at ${trail}.${key} must be an object`,
    );
    assertValidW3CTokenTree(child as TokenNode, `${trail}.${key}`);
  }
}

test("design/tokens.json is valid W3C Design Tokens format", async () => {
  const raw = await fs.readFile(TOKENS_PATH, "utf8");
  const tokens = JSON.parse(raw) as TokenNode;

  assertValidW3CTokenTree(tokens, "root");
});

test("design/tokens.json includes key color, typography, semantic, dimension, and shadow tokens", async () => {
  const raw = await fs.readFile(TOKENS_PATH, "utf8");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokens = JSON.parse(raw) as Record<string, any>;

  assert.equal(tokens.color.chill["700"].$value, "#008596");
  assert.equal(tokens.color.chill["700"].$type, "color");
  assert.equal(tokens.color.primary.DEFAULT.$value, "{color.chill.700}");
  assert.equal(tokens.color.secondary.DEFAULT.$value, "#ea580c");

  assert.deepEqual(tokens.typography.fontFamily.sans.$value, [
    "Nunito",
    "sans-serif",
  ]);
  assert.equal(tokens.typography.fontFamily.sans.$type, "fontFamily");
  assert.equal(tokens.typography.fontSize.xxs.$value, "0.625rem");

  assert.equal(tokens.semantic.light.background.$value, "oklch(1 0 0)");
  assert.equal(tokens.semantic.dark.background.$value, "oklch(0.145 0 0)");

  assert.equal(tokens.dimension.radius.base.$value, "0.625rem");
  assert.equal(tokens.shadow.neon.$type, "shadow");
});
