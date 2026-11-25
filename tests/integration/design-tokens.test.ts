import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

const GLOBALS_CSS_PATH = path.resolve(
  process.cwd(),
  "src/app/(app)/globals.css",
);

function parseHexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace("#", "");
  assert.match(
    normalized,
    /^[0-9a-fA-F]{6}$/,
    `expected 6-digit hex, got "${hex}"`,
  );
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

function linearizeChannel(channel: number): number {
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHexToRgb(hex);
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  );
}

function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Resolves CSS `var(--token)` references up to 6 hops against a variable table. */
function resolveVar(
  name: string,
  vars: Record<string, string>,
  depth = 0,
): string {
  assert.ok(depth < 6, `cyclic CSS variable reference for ${name}`);
  const raw = vars[name];
  assert.ok(raw, `expected CSS variable ${name} to be defined`);
  const match = raw.trim().match(/^var\((--[^,)]+)\)$/);
  if (match?.[1]) {
    return resolveVar(match[1], vars, depth + 1);
  }
  return raw.trim();
}

async function compileTokenTables(): Promise<{
  rawCss: string;
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
}> {
  const sourceCss = fs.readFileSync(GLOBALS_CSS_PATH, "utf8");
  const result = await postcss([tailwindcss()]).process(sourceCss, {
    from: GLOBALS_CSS_PATH,
  });
  const root = postcss.parse(result.css);

  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};

  root.walkRules((rule) => {
    const target =
      rule.selector === ":root, :host" || rule.selector === ":root"
        ? lightVars
        : rule.selector === ".dark"
          ? darkVars
          : null;
    if (!target) return;

    rule.walkDecls((decl) => {
      if (decl.parent === rule && decl.prop.startsWith("--")) {
        target[decl.prop] = decl.value;
      }
    });
  });

  return { rawCss: result.css, lightVars, darkVars };
}

const compiledTokensPromise = compileTokenTables();

test("semantic tokens exist in light and dark themes and legacy RGB variables are removed", async () => {
  const { rawCss, lightVars, darkVars } = await compiledTokensPromise;

  const requiredRuntimeTokens = [
    "--background",
    "--surface",
    "--surface-muted",
    "--surface-elevated",
    "--foreground",
    "--foreground-muted",
    "--muted",
    "--muted-foreground",
    "--border",
    "--border-subtle",
    "--border-strong",
    "--input",
    "--ring",
    "--primary",
    "--primary-foreground",
    "--secondary",
    "--secondary-foreground",
    "--accent",
    "--accent-foreground",
    "--status-success",
    "--status-success-foreground",
    "--status-success-subtle",
    "--status-success-border",
    "--status-warning",
    "--status-warning-foreground",
    "--status-warning-subtle",
    "--status-warning-border",
    "--status-error",
    "--status-error-foreground",
    "--status-error-subtle",
    "--status-error-border",
    "--status-info",
    "--status-info-foreground",
    "--status-info-subtle",
    "--status-info-border",
    "--destructive",
    "--destructive-foreground",
  ];

  for (const token of requiredRuntimeTokens) {
    assert.ok(lightVars[token], `expected ${token} in :root`);
    assert.ok(darkVars[token], `expected ${token} in .dark`);
  }

  assert.ok(lightVars["--radius"], "expected base --radius token");
  assert.doesNotMatch(rawCss, /--foreground-rgb/);
  assert.doesNotMatch(rawCss, /--background-start-rgb/);
  assert.doesNotMatch(rawCss, /--background-end-rgb/);
  assert.doesNotMatch(rawCss, /--ring-color-50/);
});

test("light theme semantic color pairings satisfy WCAG AA contrast", async () => {
  const { lightVars } = await compiledTokensPromise;

  const textPairs: [string, string, string][] = [
    ["foreground on background", "--foreground", "--background"],
    ["foreground on surface-muted", "--foreground", "--surface-muted"],
    ["foreground-muted on background", "--foreground-muted", "--background"],
    ["muted-foreground on muted", "--muted-foreground", "--muted"],
    ["primary on background", "--primary", "--background"],
    ["primary-foreground on primary", "--primary-foreground", "--primary"],
    ["secondary on background", "--secondary", "--background"],
    [
      "secondary-foreground on secondary",
      "--secondary-foreground",
      "--secondary",
    ],
    ["accent-foreground on accent", "--accent-foreground", "--accent"],
    [
      "status-success on status-success-subtle",
      "--status-success",
      "--status-success-subtle",
    ],
    [
      "status-success-foreground on status-success",
      "--status-success-foreground",
      "--status-success",
    ],
    [
      "status-warning on status-warning-subtle",
      "--status-warning",
      "--status-warning-subtle",
    ],
    [
      "status-warning-foreground on status-warning",
      "--status-warning-foreground",
      "--status-warning",
    ],
    [
      "status-error on status-error-subtle",
      "--status-error",
      "--status-error-subtle",
    ],
    [
      "status-error-foreground on status-error",
      "--status-error-foreground",
      "--status-error",
    ],
    [
      "status-info on status-info-subtle",
      "--status-info",
      "--status-info-subtle",
    ],
    [
      "status-info-foreground on status-info",
      "--status-info-foreground",
      "--status-info",
    ],
  ];

  for (const [label, fgToken, bgToken] of textPairs) {
    const ratio = contrastRatio(
      resolveVar(fgToken, lightVars),
      resolveVar(bgToken, lightVars),
    );
    assert.ok(
      ratio >= 4.5,
      `expected light ${label} contrast >= 4.5:1, got ${ratio.toFixed(2)}:1`,
    );
  }

  const uiPairs: [string, string, string][] = [
    ["ring on background", "--ring", "--background"],
    ["border-strong on background", "--border-strong", "--background"],
    [
      "status-success-border on status-success-subtle",
      "--status-success-border",
      "--status-success-subtle",
    ],
    [
      "status-warning-border on status-warning-subtle",
      "--status-warning-border",
      "--status-warning-subtle",
    ],
    [
      "status-error-border on status-error-subtle",
      "--status-error-border",
      "--status-error-subtle",
    ],
    [
      "status-info-border on status-info-subtle",
      "--status-info-border",
      "--status-info-subtle",
    ],
  ];

  for (const [label, fgToken, bgToken] of uiPairs) {
    const ratio = contrastRatio(
      resolveVar(fgToken, lightVars),
      resolveVar(bgToken, lightVars),
    );
    assert.ok(
      ratio >= 3.0,
      `expected light ${label} UI contrast >= 3.0:1, got ${ratio.toFixed(2)}:1`,
    );
  }
});

test("dark theme semantic color pairings satisfy WCAG AA contrast", async () => {
  const { lightVars, darkVars } = await compiledTokensPromise;
  const mergedDark = { ...lightVars, ...darkVars };

  const textPairs: [string, string, string][] = [
    ["foreground on background", "--foreground", "--background"],
    ["foreground on surface", "--foreground", "--surface"],
    ["foreground-muted on background", "--foreground-muted", "--background"],
    ["muted-foreground on muted", "--muted-foreground", "--muted"],
    ["primary on background", "--primary", "--background"],
    ["primary-foreground on primary", "--primary-foreground", "--primary"],
    ["secondary on background", "--secondary", "--background"],
    [
      "secondary-foreground on secondary",
      "--secondary-foreground",
      "--secondary",
    ],
    ["accent-foreground on accent", "--accent-foreground", "--accent"],
    [
      "status-success on status-success-subtle",
      "--status-success",
      "--status-success-subtle",
    ],
    [
      "status-warning on status-warning-subtle",
      "--status-warning",
      "--status-warning-subtle",
    ],
    [
      "status-error on status-error-subtle",
      "--status-error",
      "--status-error-subtle",
    ],
    [
      "status-info on status-info-subtle",
      "--status-info",
      "--status-info-subtle",
    ],
  ];

  for (const [label, fgToken, bgToken] of textPairs) {
    const ratio = contrastRatio(
      resolveVar(fgToken, mergedDark),
      resolveVar(bgToken, mergedDark),
    );
    assert.ok(
      ratio >= 4.5,
      `expected dark ${label} contrast >= 4.5:1, got ${ratio.toFixed(2)}:1`,
    );
  }

  const ringRatio = contrastRatio(
    resolveVar("--ring", mergedDark),
    resolveVar("--background", mergedDark),
  );
  assert.ok(
    ringRatio >= 3.0,
    `expected dark ring contrast >= 3.0:1, got ${ringRatio.toFixed(2)}:1`,
  );
});
