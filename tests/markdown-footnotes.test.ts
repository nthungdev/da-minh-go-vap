import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  getNextFootnoteNumber,
  insertFootnoteMarkup,
} from "../src/payload/fields/markdown/footnote-markup.ts";
import { preserveMarkdownWhitespace } from "../src/utils/markdown-whitespace.ts";

test("preserveMarkdownWhitespace preserves single-line footnote definitions", () => {
  const input = [
    "Paragraph with a footnote[^1].",
    "",
    "[^1]: Single-line footnote definition.",
    "  [^2]: Footnote definition with 2 leading spaces.",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), input);
});

test("preserveMarkdownWhitespace preserves 4-space and tab-indented multi-line footnote continuations", () => {
  const input = [
    "Main text[^1].",
    "",
    "[^1]: First line of footnote.",
    "    Second line with 4 spaces.",
    "",
    "    Second paragraph with 4 spaces.",
    "\tTab-indented continuation.",
    "",
    "    Indented paragraph outside footnote should still convert below:",
    "",
    "Normal paragraph.",
    "    Four-space indented paragraph.",
  ].join("\n");

  const expected = [
    "Main text[^1].",
    "",
    "[^1]: First line of footnote.",
    "    Second line with 4 spaces.",
    "",
    "    Second paragraph with 4 spaces.",
    "\tTab-indented continuation.",
    "",
    "    Indented paragraph outside footnote should still convert below:",
    "",
    "Normal paragraph.",
    "\u00A0\u00A0\u00A0\u00A0Four-space indented paragraph.",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), expected);
});

test("preserveMarkdownWhitespace ends footnote context when a non-indented paragraph follows a blank line", () => {
  const input = [
    "[^1]: Footnote text.",
    "",
    "Regular paragraph after footnote.",
    "    Indented regular line.",
  ].join("\n");

  const expected = [
    "[^1]: Footnote text.",
    "",
    "Regular paragraph after footnote.",
    "\u00A0\u00A0\u00A0\u00A0Indented regular line.",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), expected);
});

test("getNextFootnoteNumber computes the next sequential number from existing markers", () => {
  assert.equal(getNextFootnoteNumber("Plain text without footnotes."), 1);
  assert.equal(getNextFootnoteNumber("Text[^note] with named footnote."), 1);
  assert.equal(
    getNextFootnoteNumber("First[^1] and third[^3].\n\n[^1]: A\n[^3]: B"),
    4,
  );
});

test("insertFootnoteMarkup inserts [^n] at cursor and appends [^n]:  at bottom with clean spacing", () => {
  const first = insertFootnoteMarkup("Hello world.", 5);
  assert.equal(first.footnoteNumber, 1);
  assert.equal(first.nextValue, "Hello[^1] world.\n\n[^1]: ");
  assert.equal(first.replacementStart, 5);
  assert.equal(first.replacementText, "[^1] world.\n\n[^1]: ");

  const second = insertFootnoteMarkup("Hello[^1] world.\n\n[^1]: First.", 15);
  assert.equal(second.footnoteNumber, 2);
  assert.equal(
    second.nextValue,
    "Hello[^1] world[^2].\n\n[^1]: First.\n\n[^2]: ",
  );

  const trailingNewline = insertFootnoteMarkup(
    "Line ending with newline.\n",
    25,
  );
  assert.equal(trailingNewline.footnoteNumber, 1);
  assert.equal(
    trailingNewline.nextValue,
    "Line ending with newline.[^1]\n\n[^1]: ",
  );
});

function renderMarkdown(input: string): string {
  return renderToStaticMarkup(
    createElement(
      Markdown,
      { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeRaw] },
      input,
    ),
  );
}

test("rendered footnotes have matching href=#id targets without double clobber prefix", () => {
  const input = preserveMarkdownWhitespace(
    [
      "First paragraph[^1] and second paragraph[^2].",
      "",
      "[^1]: First footnote.",
      "[^2]: Second footnote.",
    ].join("\n"),
  );

  const html = renderMarkdown(input);

  assert.equal(html.includes("user-content-user-content-"), false);

  const ids = new Set(
    Array.from(html.matchAll(/\bid="([^"]+)"/g), (m) => m[1]),
  );
  const hashRefs = Array.from(html.matchAll(/\bhref="#([^"]+)"/g), (m) => m[1]);

  assert.ok(hashRefs.length >= 4, "expected forward and back footnote links");
  for (const targetId of hashRefs) {
    assert.ok(
      ids.has(targetId),
      `expected href="#${targetId}" to match an element id in rendered HTML`,
    );
  }
});

test("raw HTML style blocks and class attributes render intact", () => {
  const html = renderMarkdown(
    preserveMarkdownWhitespace(
      [
        '<section class="vocation-invite" aria-labelledby="invite-title">',
        "  <style>",
        "    .card{color:red}",
        "  </style>",
        '  <h2 id="invite-title">Title</h2>',
        '  <div class="card">Body</div>',
        "</section>",
      ].join("\n"),
    ),
  );

  assert.doesNotMatch(html, /\u00A0/);
  assert.match(
    html,
    /<section class="vocation-invite" aria-labelledby="invite-title">/,
  );
  assert.match(html, /<style>\s*\.card\{color:red\}\s*<\/style>/);
  assert.match(html, /<h2 id="invite-title">/);
  assert.match(html, /<div class="card">Body<\/div>/);
});

test("preserveMarkdownWhitespace leaves indented CSS in a top-level style block untouched", () => {
  const input = [
    "<style>",
    "  .card {",
    "    color: red;",
    "",
    "  }",
    "</style>",
    "",
    "  Indented paragraph after the style block.",
  ].join("\n");

  const expected = [
    "<style>",
    "  .card {",
    "    color: red;",
    "",
    "  }",
    "</style>",
    "",
    "\u00A0\u00A0Indented paragraph after the style block.",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), expected);
});

test("preserveMarkdownWhitespace leaves block-level HTML untouched until a blank line", () => {
  const input = [
    '<div class="grid">',
    '  <div class="item">One</div>',
    '  <div class="item">Two</div>',
    "</div>",
    "",
    "  Indented paragraph.",
  ].join("\n");

  const expected = [
    '<div class="grid">',
    '  <div class="item">One</div>',
    '  <div class="item">Two</div>',
    "</div>",
    "",
    "\u00A0\u00A0Indented paragraph.",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), expected);
});

test("preserveMarkdownWhitespace handles single-line style blocks and comments", () => {
  const input = [
    "<style>.a{color:red}</style>",
    "  Indented paragraph.",
    "<!-- note",
    "  still a comment -->",
    "  Indented paragraph.",
  ].join("\n");

  const expected = [
    "<style>.a{color:red}</style>",
    "\u00A0\u00A0Indented paragraph.",
    "<!-- note",
    "  still a comment -->",
    "\u00A0\u00A0Indented paragraph.",
  ].join("\n");

  assert.equal(preserveMarkdownWhitespace(input), expected);
});

test("preserveMarkdownWhitespace does not treat a lone inline tag inside a paragraph as an HTML block", () => {
  const input = ["Paragraph text", "<span>", "  continued"].join("\n");
  const expected = ["Paragraph text", "<span>", "\u00A0\u00A0continued"].join(
    "\n",
  );

  assert.equal(preserveMarkdownWhitespace(input), expected);
});

test("style nested in a section keeps CSS split by blank lines inside the style element", () => {
  const html = renderMarkdown(
    preserveMarkdownWhitespace(
      [
        '<section class="vocation-invite">',
        "  <style>",
        "    :root{",
        "      --bg:#faf9f6;",
        "    }",
        "",
        "    .card{",
        "      border-radius:20px;",
        "    }",
        "  </style>",
        '  <div class="card">Body</div>',
        "</section>",
      ].join("\n"),
    ),
  );

  assert.doesNotMatch(html, / /);
  assert.match(
    html,
    /<style>[^<]*\.card\{[^<]*border-radius:20px;[^<]*<\/style>/,
  );
  assert.doesNotMatch(html, /<p>[^<]*\.card/);
  assert.match(html, /<div class="card">Body<\/div>/);
});

test("style opened on the same line as a block tag stays raw across blank lines", () => {
  for (const opener of [
    '<section class="x"><style>',
    "<div>",
    "<div><p>ok</p><style>",
  ]) {
    const isRaw = opener.endsWith("<style>");
    const lines = isRaw
      ? [
          opener,
          "  .a{",
          "    color:red;",
          "  }",
          "",
          "    .b{",
          "      color:blue;",
          "    }",
          "  </style>",
          "</section>",
        ]
      : [
          opener,
          "  <style>",
          "  .a{color:red}",
          "",
          "    .b{",
          "      color:blue;",
          "    }",
          "  </style>",
          "</div>",
        ];
    const html = renderMarkdown(preserveMarkdownWhitespace(lines.join("\n")));
    assert.doesNotMatch(html, /\u00A0/, opener);
    assert.match(
      html,
      /<style>[^<]*\.b\{[^<]*color:blue;[^<]*<\/style>/,
      opener,
    );
  }
});

test("preserveMarkdownWhitespace stays raw when a line closes one style and opens another", () => {
  const input = [
    "<style>",
    "  .a{}",
    "</style><style>",
    "  .b{}",
    "",
    "  .c{}",
    "</style>",
  ].join("\n");
  assert.equal(preserveMarkdownWhitespace(input), input);
});
