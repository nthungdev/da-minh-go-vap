import assert from "node:assert/strict";
import fs from "node:fs";
import * as nodeModule from "node:module";
import path from "node:path";
import test, { after } from "node:test";
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
        return nextResolve(new URL(`file://${resolved}`).href, context);
      }
    }

    if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith("file://") &&
      !context.parentURL.includes("/node_modules/")
    ) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname);
      const resolved = resolveWorkspaceTarget(parentDir, specifier);
      if (resolved) {
        return nextResolve(new URL(`file://${resolved}`).href, context);
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
      const filePath = new URL(url).pathname;
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

function normalizeSelector(selector: string): string {
  return selector.replace(/\s+/g, " ").trim();
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
  markdownRule: Rule;
  nestedRules: Rule[];
}> {
  const sourceCss = fs.readFileSync(GLOBALS_CSS_PATH, "utf8");
  const result = await postcss([tailwindcss()]).process(sourceCss, {
    from: GLOBALS_CSS_PATH,
  });
  const root = postcss.parse(result.css);

  const themeVars: Record<string, string> = {};
  let markdownRule: Rule | undefined;

  root.walkRules((rule) => {
    if (rule.selector === ":root, :host" || rule.selector === ":root") {
      Object.assign(themeVars, getDeclarations(rule));
    }
    if (rule.selector === ".markdown") {
      markdownRule = rule;
    }
  });

  assert.ok(markdownRule, "expected compiled CSS to contain .markdown rule");

  const nestedRules: Rule[] = [];
  markdownRule.walkRules((child) => {
    nestedRules.push(child);
  });

  return { themeVars, markdownRule, nestedRules };
}

function findNestedRule(nestedRules: Rule[], expectedSelector: string): Rule {
  const target = normalizeSelector(expectedSelector);
  const match = nestedRules.find(
    (rule) => normalizeSelector(rule.selector) === target,
  );
  assert.ok(match, `expected compiled .markdown rule for selector "${target}"`);
  return match;
}

const compiledCssPromise = compileGlobalsCss();

test("compiled CSS styles .markdown h1 and h2 with non-prose scoping and footnote exclusion", async () => {
  const { themeVars, nestedRules } = await compiledCssPromise;

  assert.equal(themeVars["--color-secondary"], "#ea580c");
  assert.equal(themeVars["--color-chill-700"], "#008596");
  assert.equal(themeVars["--color-primary"], "var(--color-chill-700)");

  const headingMarginRule = findNestedRule(
    nestedRules,
    "&:where(:not(.prose)) :where( h1, h2:not(#footnote-label, #user-content-footnote-label), h3, h4, h5, h6 )",
  );
  const headingMarginDecls = getDeclarations(headingMarginRule);
  assert.ok(headingMarginDecls["margin-top"]);
  assert.ok(headingMarginDecls["margin-bottom"]);

  const h1Rule = findNestedRule(
    nestedRules,
    "&:where(:not(.prose)) :where(h1)",
  );
  const h1Decls = getDeclarations(h1Rule);
  assert.equal(h1Decls.color, "var(--color-secondary)");
  assert.equal(h1Decls["font-size"], "var(--text-3xl)");

  const h2Rule = findNestedRule(
    nestedRules,
    "&:where(:not(.prose)) :where(h2:not(#footnote-label, #user-content-footnote-label))",
  );
  const h2Decls = getDeclarations(h2Rule);
  assert.equal(h2Decls.color, "var(--color-primary)");
  assert.equal(h2Decls["font-size"], "var(--text-2xl)");
});

test("compiled CSS styles .markdown non-prose blockquote, blockquote.quote, and footer", async () => {
  const { themeVars, nestedRules } = await compiledCssPromise;

  assert.equal(themeVars["--text-sm"], "0.875rem");
  assert.ok(themeVars["--radius"]);

  const quoteRule = findNestedRule(
    nestedRules,
    "&:where(:not(.prose)) :where(blockquote), :where(blockquote).quote",
  );
  const quoteDecls = getDeclarations(quoteRule);
  assert.equal(quoteDecls["background-color"], "#eefcfc");
  assert.equal(quoteDecls["border-color"], "#5bbac0");
  assert.equal(quoteDecls["border-left-width"], "4px");
  assert.equal(quoteDecls["border-radius"], "var(--radius)");
  assert.equal(quoteDecls.color, "#007a8b");
  assert.equal(quoteDecls["font-style"], "italic");

  const quotePseudoRule = findNestedRule(
    nestedRules,
    ":where(blockquote).quote :where(p:first-of-type)::before, :where(blockquote).quote :where(p:last-of-type)::after",
  );
  assert.equal(getDeclarations(quotePseudoRule).content, "none");

  const footerRule = findNestedRule(
    nestedRules,
    "&:where(:not(.prose)) :where(blockquote footer), :where(blockquote).quote :where(footer)",
  );
  const footerDecls = getDeclarations(footerRule);
  assert.equal(footerDecls["text-align"], "right");
  assert.equal(footerDecls["font-size"], "var(--text-sm)");
  assert.ok(footerDecls["margin-top"]);
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
