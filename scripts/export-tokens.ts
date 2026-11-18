/**
 * Parses `src/app/(app)/globals.css` and exports W3C Design Tokens JSON
 * to `design/tokens.json`.
 *
 * Usage: pnpm tokens:export  (Node >= 22.18 runs TypeScript directly)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface W3CToken {
  $value: string | string[] | number;
  $type: string;
  $description?: string;
}

export interface W3CTokenGroup {
  [key: string]: W3CToken | W3CTokenGroup;
}

export interface CssVariableMap {
  [name: string]: string;
}

export interface ParsedCssBlocks {
  theme: CssVariableMap;
  themeInline: CssVariableMap;
  root: CssVariableMap;
  dark: CssVariableMap;
}

const DEFAULT_CSS_PATH = path.resolve("src/app/(app)/globals.css");
const DEFAULT_OUT_PATH = path.resolve("design/tokens.json");

/**
 * Extracts CSS custom properties (`--name: value;`) from a CSS block body.
 */
export function parseCssVariables(blockBody: string): CssVariableMap {
  const vars: CssVariableMap = {};
  const cleaned = blockBody.replace(/\/\*[\s\S]*?\*\//g, "");
  const varRegex = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;

  for (const match of cleaned.matchAll(varRegex)) {
    const rawName = match[1];
    const rawValue = match[2];
    if (!rawName || !rawValue) continue;
    const name = rawName.trim();
    const value = rawValue.replace(/\s+/g, " ").trim();
    vars[name] = value;
  }

  return vars;
}

/**
 * Finds the body of a top-level CSS block matching `selector` using brace depth tracking.
 */
function extractBlockBody(css: string, selectorRegex: RegExp): string {
  const match = selectorRegex.exec(css);
  if (!match) return "";

  const openBraceIndex = css.indexOf("{", match.index);
  if (openBraceIndex === -1) return "";

  let depth = 0;
  for (let i = openBraceIndex; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        return css.slice(openBraceIndex + 1, i);
      }
    }
  }

  return "";
}

/**
 * Parses `@theme`, `@theme inline`, `:root`, and `.dark` blocks from `globals.css`.
 */
export function parseCssBlocks(css: string): ParsedCssBlocks {
  return {
    theme: parseCssVariables(extractBlockBody(css, /^@theme\s*\{/m)),
    themeInline: parseCssVariables(
      extractBlockBody(css, /^@theme\s+inline\s*\{/m),
    ),
    root: parseCssVariables(extractBlockBody(css, /^:root\s*\{/m)),
    dark: parseCssVariables(extractBlockBody(css, /^\.dark\s*\{/m)),
  };
}

/**
 * Resolves a CSS `var(--color-...)` reference into a W3C token alias if possible.
 */
function resolveColorValue(rawValue: string): string {
  const varMatch = /^var\(--color-([a-zA-Z0-9-]+)\)$/.exec(rawValue);
  const captured = varMatch?.[1];
  if (captured) {
    const parts = captured.split("-");
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last) && parts.length > 1) {
      const family = parts.slice(0, -1).join("-");
      return `{color.${family}.${last}}`;
    }
    return `{color.${captured}.DEFAULT}`;
  }
  return rawValue;
}

/**
 * Inserts a `--color-*` or `--ring-color-*` variable into a nested color group.
 */
function insertColorToken(
  colorGroup: W3CTokenGroup,
  family: string,
  shade: string,
  value: string,
): void {
  if (!colorGroup[family] || "$value" in colorGroup[family]) {
    colorGroup[family] = {};
  }
  const familyGroup = colorGroup[family] as W3CTokenGroup;
  familyGroup[shade] = {
    $value: resolveColorValue(value),
    $type: "color",
  };
}

/**
 * Builds the W3C Design Tokens document from parsed CSS blocks.
 */
export function buildW3CTokens(blocks: ParsedCssBlocks): W3CTokenGroup {
  const color: W3CTokenGroup = {};
  const fontSize: W3CTokenGroup = {};
  const container: W3CTokenGroup = {};
  const shadow: W3CTokenGroup = {};

  for (const [name, value] of Object.entries(blocks.theme)) {
    if (name.startsWith("--color-")) {
      const key = name.slice("--color-".length);
      const parts = key.split("-");
      const last = parts[parts.length - 1];
      if (last && /^\d+$/.test(last) && parts.length > 1) {
        insertColorToken(color, parts.slice(0, -1).join("-"), last, value);
      } else {
        insertColorToken(color, key, "DEFAULT", value);
      }
    } else if (name.startsWith("--ring-color-")) {
      const shade = name.slice("--ring-color-".length);
      insertColorToken(color, "ring", shade, value);
    } else if (name === "--ring-color") {
      insertColorToken(color, "ring", "DEFAULT", value);
    } else if (name.startsWith("--text-")) {
      const sizeKey = name.slice("--text-".length);
      fontSize[sizeKey] = { $value: value, $type: "dimension" };
    } else if (name.startsWith("--container-")) {
      const containerKey = name.slice("--container-".length);
      container[containerKey] = { $value: value, $type: "dimension" };
    } else if (name.startsWith("--shadow-")) {
      const shadowKey = name.slice("--shadow-".length);
      shadow[shadowKey] = { $value: value, $type: "shadow" };
    }
  }

  const fontFamily: W3CTokenGroup = {
    sans: {
      $value: ["Nunito", "sans-serif"],
      $type: "fontFamily",
      $description:
        "Primary UI and body font configured via next/font/local in layout.tsx",
    },
    heading: {
      $value: "{typography.fontFamily.sans}",
      $type: "fontFamily",
    },
    "noto-serif": {
      $value: ["Noto Serif", "Times New Roman", "serif"],
      $type: "fontFamily",
      $description: "Serif face for news article templates",
    },
    lora: {
      $value: ["Lora", "Times New Roman", "serif"],
      $type: "fontFamily",
      $description: "Serif face for bilingual quote post templates",
    },
  };

  const radius: W3CTokenGroup = {};
  if (blocks.root["--radius"]) {
    radius.base = { $value: blocks.root["--radius"], $type: "dimension" };
  }
  for (const [name, value] of Object.entries(blocks.themeInline)) {
    if (name.startsWith("--radius-")) {
      const key = name.slice("--radius-".length);
      radius[key] = { $value: value, $type: "dimension" };
    }
  }

  const lightSemantic: W3CTokenGroup = {};
  for (const [name, value] of Object.entries(blocks.root)) {
    if (name === "--radius") continue;
    const key = name.slice(2);
    lightSemantic[key] = { $value: value, $type: "color" };
  }

  const darkSemantic: W3CTokenGroup = {};
  for (const [name, value] of Object.entries(blocks.dark)) {
    const key = name.slice(2);
    darkSemantic[key] = { $value: value, $type: "color" };
  }

  return {
    $description: "W3C Design Tokens exported from src/app/(app)/globals.css",
    color,
    semantic: {
      light: lightSemantic,
      dark: darkSemantic,
    },
    typography: {
      fontFamily,
      fontSize,
    },
    dimension: {
      container,
      radius,
    },
    shadow,
  } as unknown as W3CTokenGroup;
}

/**
 * Reads `cssPath`, generates W3C Design Tokens JSON, and writes it to `outPath`.
 */
export async function exportTokens(
  cssPath: string = DEFAULT_CSS_PATH,
  outPath: string = DEFAULT_OUT_PATH,
): Promise<W3CTokenGroup> {
  const css = await fs.readFile(cssPath, "utf8");
  const blocks = parseCssBlocks(css);
  const tokens = buildW3CTokens(blocks);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  return tokens;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  await exportTokens();
  console.log(`Exported W3C design tokens to ${DEFAULT_OUT_PATH}`);
}
