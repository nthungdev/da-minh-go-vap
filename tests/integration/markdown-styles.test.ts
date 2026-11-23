import assert from "node:assert/strict";
import fs from "node:fs";
import * as nodeModule from "node:module";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/postcss";
import postcss, { type Rule } from "postcss";
import { type ComponentType, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { preserveMarkdownWhitespace } from "../../src/utils/markdown-whitespace.ts";

interface ResolveContext {
  parentURL?: string;
}

interface ResolveResult {
  url: string;
  shortCircuit?: boolean;
}

interface LoadResult {
  format: string;
  source: string;
  shortCircuit?: boolean;
}

type RegisterHooksFn = (hooks: {
  resolve: (
    specifier: string,
    context: ResolveContext,
    nextResolve: (specifier: string, context: ResolveContext) => ResolveResult,
  ) => ResolveResult;
  load: (
    url: string,
    context: Record<string, unknown>,
    nextLoad: (url: string, context: Record<string, unknown>) => LoadResult,
  ) => LoadResult;
}) => { deregister: () => void };

const registerHooks = (
  nodeModule as unknown as { registerHooks: RegisterHooksFn }
).registerHooks;

const WORKSPACE_ROOT = process.cwd();
const GLOBALS_CSS_PATH = path.resolve(
  WORKSPACE_ROOT,
  "src/app/(app)/globals.css",
);

function resolveWorkspaceTarget(
  baseDir: string,
  specifier: string,
): string | null {
  const target = path.resolve(baseDir, specifier);
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = `${target}${ext}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

const hookHandle = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveWorkspaceTarget(
        path.join(WORKSPACE_ROOT, "src"),
        specifier.slice(2),
      );
      if (resolved) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
    }

    if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith("file://") &&
      !context.parentURL.includes("/node_modules/")
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const resolved = resolveWorkspaceTarget(parentDir, specifier);
      if (resolved) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
    }

    if (
      specifier === "next/image" ||
      specifier === "next/link" ||
      specifier === "next-intl"
    ) {
      return { url: `stub:${specifier}`, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("stub:")) {
      const mod = url.slice("stub:".length);
      if (mod === "next-intl") {
        return {
          format: "module",
          source:
            'export const useLocale = () => "vi"; export const useTranslations = () => (key) => key;',
          shortCircuit: true,
        };
      }
      return {
        format: "module",
        source: "export default function Stub() { return null; }",
        shortCircuit: true,
      };
    }

    if (url.endsWith(".tsx")) {
      const filePath = fileURLToPath(url);
      const source = fs.readFileSync(filePath, "utf8");
      const transpiled = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
        },
      });
      return {
        format: "module",
        source: transpiled.outputText,
        shortCircuit: true,
      };
    }

    return nextLoad(url, context);
  },
});

after(() => {
  hookHandle.deregister();
});

const { default: AppMarkdown } = await import(
  "../../src/components/app-markdown.tsx"
);

function renderAppMarkdown(content: string): string {
  const Component = AppMarkdown as ComponentType<{ locale?: string }>;
  return renderToStaticMarkup(
    createElement(Component, { locale: "vi" }, content),
  );
}

interface ResolvedMarkdownRule {
  selectors: string[];
  declarations: Record<string, string>;
}

/** Splits a CSS selector list on top-level commas, ignoring commas inside parentheses. */
function splitTopLevelSelectors(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of selector) {
    if (ch === "(") depth += 1;
    else if (ch === ")" && depth > 0) depth -= 1;

    if (ch === "," && depth === 0) {
      const trimmed = current.replace(/\s+/g, " ").trim();
      if (trimmed) parts.push(trimmed);
      current = "";
    } else {
      current += ch;
    }
  }
  const tail = current.replace(/\s+/g, " ").trim();
  if (tail) parts.push(tail);
  return parts;
}

function combineSelectorPair(parentSel: string, branch: string): string {
  if (!parentSel) return branch;
  if (branch.includes("&")) return branch.replace(/&/g, parentSel);
  return `${parentSel} ${branch}`;
}

/** Resolves a nested CSS rule's selector list relative to its `.markdown` parent chain. */
function resolveNestedSelectors(rule: Rule): string[] {
  const chain: string[] = [];
  let cursor: Rule | undefined = rule;
  while (cursor) {
    chain.unshift(cursor.selector);
    cursor =
      cursor.parent?.type === "rule" ? (cursor.parent as Rule) : undefined;
  }

  let active = [""];
  for (const rawSelector of chain) {
    const branches = splitTopLevelSelectors(rawSelector);
    active = active.flatMap((parentSel) =>
      branches.map((branch) => combineSelectorPair(parentSel, branch)),
    );
  }
  return active;
}

function getDeclarations(rule: Rule): Record<string, string> {
  const declarations: Record<string, string> = {};
  rule.walkDecls((decl) => {
    // Only record declarations owned directly by this rule, not nested child rules.
    if (decl.parent === rule) {
      declarations[decl.prop] = decl.value;
    }
  });
  return declarations;
}

async function compileGlobalsCss(): Promise<{
  themeVars: Record<string, string>;
  markdownRules: ResolvedMarkdownRule[];
}> {
  const sourceCss = fs.readFileSync(GLOBALS_CSS_PATH, "utf8");
  const result = await postcss([tailwindcss()]).process(sourceCss, {
    from: GLOBALS_CSS_PATH,
  });
  const root = postcss.parse(result.css);

  const themeVars: Record<string, string> = {};
  const markdownRules: ResolvedMarkdownRule[] = [];

  root.walkRules((rule) => {
    if (rule.selector === ":root, :host" || rule.selector === ":root") {
      Object.assign(themeVars, getDeclarations(rule));
    }
    if (rule.selector === ".markdown") {
      rule.walkRules((child) => {
        markdownRules.push({
          selectors: resolveNestedSelectors(child),
          declarations: getDeclarations(child),
        });
      });
    }
  });

  assert.ok(
    markdownRules.length > 0,
    "expected compiled CSS to contain nested .markdown rules",
  );

  return { themeVars, markdownRules };
}

function findRuleMatching(
  rules: ResolvedMarkdownRule[],
  predicate: (
    selectors: string[],
    declarations: Record<string, string>,
  ) => boolean,
  label: string,
): ResolvedMarkdownRule {
  const match = rules.find((entry) =>
    predicate(entry.selectors, entry.declarations),
  );
  assert.ok(match, `expected compiled .markdown rule for ${label}`);
  return match;
}

const compiledCssPromise = compileGlobalsCss();

test("all compiled .markdown nested selectors remain scoped under .markdown", async () => {
  const { markdownRules } = await compiledCssPromise;
  for (const entry of markdownRules) {
    for (const selector of entry.selectors) {
      assert.ok(
        /^(?:\.markdown(?:$|[.:[\s>+~])|:where\(\.markdown\b)/.test(selector),
        `expected selector "${selector}" to stay scoped under .markdown`,
      );
    }
  }
});

test("compiled CSS styles .markdown h1 and h2 with non-prose scoping and footnote exclusion", async () => {
  const { themeVars, markdownRules } = await compiledCssPromise;

  assert.equal(themeVars["--color-secondary"], "#ea580c");
  assert.equal(themeVars["--color-chill-700"], "#008596");
  assert.equal(themeVars["--color-primary"], "var(--color-chill-700)");

  const headingMarginRule = findRuleMatching(
    markdownRules,
    (selectors, decls) =>
      Boolean(decls["margin-top"] && decls["margin-bottom"]) &&
      selectors.some(
        (s) =>
          s.includes(".markdown:where(:not(.prose))") &&
          s.includes("h1") &&
          s.includes("#footnote-label") &&
          s.includes("#user-content-footnote-label"),
      ),
    "non-prose heading margins excluding footnote labels",
  );
  assert.ok(headingMarginRule.declarations["margin-top"]);
  assert.ok(headingMarginRule.declarations["margin-bottom"]);

  const h1Rule = findRuleMatching(
    markdownRules,
    (selectors, decls) =>
      decls.color === "var(--color-secondary)" &&
      selectors.some(
        (s) => s.includes(".markdown:where(:not(.prose))") && /\bh1\b/.test(s),
      ),
    "non-prose h1 color and size",
  );
  assert.equal(h1Rule.declarations.color, "var(--color-secondary)");
  assert.equal(h1Rule.declarations["font-size"], "var(--text-3xl)");

  const h2Rule = findRuleMatching(
    markdownRules,
    (selectors, decls) =>
      decls.color === "var(--color-primary)" &&
      selectors.some(
        (s) =>
          s.includes(".markdown:where(:not(.prose))") &&
          /\bh2\b/.test(s) &&
          s.includes("#footnote-label") &&
          s.includes("#user-content-footnote-label"),
      ),
    "non-prose h2 color and size excluding footnote labels",
  );
  assert.equal(h2Rule.declarations.color, "var(--color-primary)");
  assert.equal(h2Rule.declarations["font-size"], "var(--text-2xl)");
});

test("compiled CSS styles .markdown non-prose blockquote, blockquote.quote, and footer", async () => {
  const { themeVars, markdownRules } = await compiledCssPromise;

  assert.equal(themeVars["--text-sm"], "0.875rem");
  assert.ok(themeVars["--radius"]);

  const quoteRule = findRuleMatching(
    markdownRules,
    (selectors, decls) =>
      decls["background-color"] === "#eefcfc" &&
      selectors.some(
        (s) =>
          s.includes(".markdown:where(:not(.prose))") &&
          s.includes("blockquote"),
      ) &&
      selectors.some(
        (s) =>
          s.startsWith(".markdown ") &&
          s.includes("blockquote") &&
          s.includes(".quote"),
      ),
    "non-prose blockquote and .markdown .quote card styles",
  );
  assert.equal(quoteRule.declarations["background-color"], "#eefcfc");
  assert.equal(quoteRule.declarations["border-color"], "#5bbac0");
  assert.equal(quoteRule.declarations["border-left-width"], "4px");
  assert.equal(quoteRule.declarations["border-radius"], "var(--radius)");
  assert.equal(quoteRule.declarations.color, "#007a8b");
  assert.equal(quoteRule.declarations["font-style"], "italic");

  const quotePseudoRule = findRuleMatching(
    markdownRules,
    (selectors, decls) =>
      decls.content === "none" &&
      selectors.some((s) => s.includes(".quote") && s.includes("::before")) &&
      selectors.some((s) => s.includes(".quote") && s.includes("::after")),
    ".quote decorative pseudo-element reset",
  );
  assert.equal(quotePseudoRule.declarations.content, "none");

  const footerRule = findRuleMatching(
    markdownRules,
    (selectors, decls) =>
      decls["text-align"] === "right" &&
      selectors.some(
        (s) =>
          s.includes(".markdown:where(:not(.prose))") &&
          s.includes("blockquote") &&
          s.includes("footer"),
      ) &&
      selectors.some(
        (s) =>
          s.startsWith(".markdown ") &&
          s.includes(".quote") &&
          s.includes("footer"),
      ),
    "blockquote and .quote footer attribution alignment",
  );
  assert.equal(footerRule.declarations["text-align"], "right");
  assert.equal(footerRule.declarations["font-size"], "var(--text-sm)");
  assert.ok(footerRule.declarations["margin-top"]);
});

test("AppMarkdown renders h1, h2, and standard markdown blockquote inside .markdown", () => {
  const markdown = [
    "# Heading 1",
    "",
    "## Heading 2",
    "",
    "> Standard markdown quote",
  ].join("\n");

  const html = renderAppMarkdown(markdown);

  assert.match(html, /^<div class="markdown">/);
  assert.match(html, /<h1>Heading 1<\/h1>/);
  assert.match(html, /<h2>Heading 2<\/h2>/);
  assert.match(
    html,
    /<blockquote>\s*<p>Standard markdown quote<\/p>\s*<\/blockquote>/,
  );
});

test('AppMarkdown renders HTML <blockquote class="quote"> with footer intact and no NBSP corruption', () => {
  const input = [
    '<blockquote class="quote">',
    "  <p>Hãy là chính mình một cách trọn vẹn.</p>",
    "  <footer>— Thánh Phanxicô Salêsiô</footer>",
    "</blockquote>",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), input);

  const html = renderAppMarkdown(input);

  assert.doesNotMatch(html, /\u00A0/);
  assert.match(
    html,
    /<blockquote class="quote">\s*<p>Hãy là chính mình một cách trọn vẹn\.<\/p>\s*<footer>— Thánh Phanxicô Salêsiô<\/footer>\s*<\/blockquote>/,
  );
});

test("AppMarkdown footnote heading retains text-base and text-gray-900 classes without sr-only", () => {
  const markdown = [
    "Đoạn văn có chú thích[^1].",
    "",
    "[^1]: Nội dung chú thích.",
  ].join("\n");

  const html = renderAppMarkdown(markdown);

  const headingMatch = html.match(
    /<h2 id="(?:user-content-)?footnote-label" class="([^"]+)">/,
  );
  assert.ok(headingMatch, "expected footnote label heading in rendered HTML");

  const classes = (headingMatch[1] ?? "").split(/\s+/);
  assert.ok(classes.includes("text-base"), "expected text-base class");
  assert.ok(classes.includes("text-gray-900"), "expected text-gray-900 class");
  assert.equal(
    classes.includes("sr-only"),
    false,
    "expected sr-only to be stripped",
  );
});
