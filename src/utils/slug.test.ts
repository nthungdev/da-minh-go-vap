import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import * as nodeModule from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

type ResolveHook = (
  specifier: string,
  context: object,
  nextResolve: (specifier: string, context: object) => unknown,
) => unknown;

// Available in the Node runtime, but missing from the installed @types/node.
const { registerHooks } = nodeModule as unknown as {
  registerHooks: (hooks: { resolve: ResolveHook }) => void;
};

const srcRoot = new URL("../", import.meta.url);

// node --test has no tsconfig path mapping, so resolve "@/..." to src/*.ts here.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL(specifier.slice(2), srcRoot));
      for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
        if (existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const { slugifyVietnamese } = await import("./slug.ts");

test("slugifyVietnamese strips diacritics and đ/Đ", () => {
  assert.equal(
    slugifyVietnamese("Giuse Nguyễn Văn Đức"),
    "giuse-nguyen-van-duc",
  );
  assert.equal(slugifyVietnamese("Đa Minh Gò Vấp"), "da-minh-go-vap");
  assert.equal(slugifyVietnamese("đường ĐỨC"), "duong-duc");
});

test("slugifyVietnamese collapses punctuation and whitespace", () => {
  assert.equal(slugifyVietnamese("  Lm.  Phêrô,  Trần!! "), "lm-phero-tran");
  assert.equal(slugifyVietnamese("A -- B__C"), "a-b-c");
  assert.equal(slugifyVietnamese("Tu sĩ 2024"), "tu-si-2024");
});

test("slugifyVietnamese returns an empty string for empty or symbol-only input", () => {
  assert.equal(slugifyVietnamese(""), "");
  assert.equal(slugifyVietnamese("   "), "");
  assert.equal(slugifyVietnamese("!@#$%"), "");
});
