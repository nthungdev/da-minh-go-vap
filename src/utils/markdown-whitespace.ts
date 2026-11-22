function convertLeadingSpacesToNbsp(spaces: string): string {
  return spaces
    .replace(/ /g, "\u00A0")
    .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0");
}

function getIndentWidth(spaces: string): number {
  let width = 0;
  for (const ch of spaces) {
    width += ch === "\t" ? 4 : 1;
  }
  return width;
}

function getListContentOffset(line: string): number | null {
  const match = line.match(/^([ \t]*)([-*+]|\d+[.)])([ \t]+)(.*)$/);
  if (!match) return null;
  const leading = match[1] ?? "";
  const marker = match[2] ?? "";
  const gap = match[3] ?? "";
  return getIndentWidth(leading) + marker.length + getIndentWidth(gap);
}

function isFootnoteDefinitionStart(line: string): boolean {
  // GFM footnote definitions allow 0-3 leading spaces before `[^label]:`.
  return /^ {0,3}\[\^[^\s\]]+\]:/.test(line);
}

function isIndentedBlockSyntax(spaces: string, rest: string): boolean {
  if (getIndentWidth(spaces) > 3) return false;
  // CommonMark allows 0-3 leading spaces for ATX headings, thematic breaks, and GFM tables.
  return (
    /^#{1,6}(?:\s|$)/.test(rest) ||
    /^(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/.test(rest) ||
    rest.startsWith("|")
  );
}

// CommonMark HTML block start conditions 1-7 (spec section 4.6).
const HTML_BLOCK_BLOCK_TAGS =
  "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
const HTML_ATTRIBUTE =
  "\\s+[A-Za-z_:][\\w.:-]*(?:\\s*=\\s*(?:[^\\s\"'=<>`]+|'[^']*'|\"[^\"]*\"))?";

interface HtmlBlockRule {
  start: RegExp;
  /** Closing pattern; `null` means the block ends at the next blank line. */
  end: RegExp | null;
  canInterruptParagraph: boolean;
}

const RAW_TEXT_RULE: HtmlBlockRule = {
  start: /^<(?:script|pre|style|textarea)(?:\s|>|$)/i,
  end: /<\/(?:script|pre|style|textarea)>/i,
  canInterruptParagraph: true,
};

const HTML_BLOCK_RULES: HtmlBlockRule[] = [
  RAW_TEXT_RULE,
  { start: /^<!--/, end: /-->/, canInterruptParagraph: true },
  { start: /^<\?/, end: /\?>/, canInterruptParagraph: true },
  { start: /^<![A-Za-z]/, end: />/, canInterruptParagraph: true },
  { start: /^<!\[CDATA\[/, end: /\]\]>/, canInterruptParagraph: true },
  {
    start: new RegExp(`^</?(?:${HTML_BLOCK_BLOCK_TAGS})(?:\\s|/?>|$)`, "i"),
    end: null,
    canInterruptParagraph: true,
  },
  {
    start: new RegExp(
      `^(?:<(?!(?:script|style|pre|textarea)\\b)[A-Za-z][A-Za-z0-9-]*(?:${HTML_ATTRIBUTE})*\\s*/?>|</[A-Za-z][A-Za-z0-9-]*\\s*>)\\s*$`,
      "i",
    ),
    end: null,
    canInterruptParagraph: false,
  },
];

interface MarkdownWhitespaceState {
  activeFence: { char: string; length: number } | null;
  /** Open raw HTML block whose lines must pass through untouched. */
  activeHtmlBlock: HtmlBlockRule | null;
  /** Inside a multi-line HTML open tag (e.g. `<a\n  href="...">`) awaiting `>`. */
  inHtmlOpenTag: boolean;
  /** Active quote delimiter while scanning inside a multi-line HTML open tag. */
  htmlTagQuote: '"' | "'" | null;
  /** Whether the current multi-line open tag started standalone (not in a paragraph). */
  htmlTagStandalone: boolean;
  /** Whether the previous line could be continued as a paragraph. */
  inParagraph: boolean;
  listContentOffset: number | null;
  sawBlankLineInList: boolean;
  inFootnoteDefinition: boolean;
  sawBlankLineInFootnote: boolean;
}

function resetListState(state: MarkdownWhitespaceState): void {
  state.listContentOffset = null;
  state.sawBlankLineInList = false;
}

function resetFootnoteState(state: MarkdownWhitespaceState): void {
  state.inFootnoteDefinition = false;
  state.sawBlankLineInFootnote = false;
}

function tryCloseFence(trimmed: string, state: MarkdownWhitespaceState): void {
  if (!state.activeFence) return;
  const closeMatch = trimmed.match(/^(`{3,}|~{3,})[ \t]*$/);
  const closeMarker = closeMatch?.[1];
  if (
    closeMarker &&
    closeMarker[0] === state.activeFence.char &&
    closeMarker.length >= state.activeFence.length
  ) {
    state.activeFence = null;
  }
}

function tryOpenFence(
  line: string,
  trimmed: string,
  state: MarkdownWhitespaceState,
): boolean {
  const openMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
  const openMarker = openMatch?.[1];
  const openInfo = openMatch?.[2] ?? "";
  if (!openMarker || (openMarker[0] !== "~" && openInfo.includes("`"))) {
    return false;
  }

  const fenceIndent = getIndentWidth(
    line.slice(0, line.length - trimmed.length),
  );
  if (
    state.listContentOffset !== null &&
    fenceIndent < state.listContentOffset
  ) {
    resetListState(state);
  }
  if (state.inFootnoteDefinition && fenceIndent < 4) {
    resetFootnoteState(state);
  }
  state.activeFence = {
    char: openMarker[0] ?? "`",
    length: openMarker.length,
  };
  return true;
}

const RAW_TEXT_TAG = /<(\/?)(?:script|pre|style|textarea)(?=[\s/>]|$)/gi;

/**
 * Reports whether a raw-text element is still open at the end of `text`,
 * scanning every opening and closing `<style>`, `<script>`, `<pre>` or
 * `<textarea>` tag on the line, not just one at the start.
 */
function endsInsideRawTextElement(text: string, startsOpen = false): boolean {
  let open = startsOpen;
  for (const match of text.matchAll(RAW_TEXT_TAG)) {
    open = match[1] !== "/";
  }
  return open;
}

/**
 * Enters raw-text mode when a `<style>`, `<script>`, `<pre>` or `<textarea>`
 * opens without closing on the same line, at any indentation or nesting.
 * Every line up to the closing tag then passes through untouched, even across
 * blank lines: rehype-raw folds that text back into the element, so CSS split
 * by blank lines still applies.
 */
function tryOpenRawTextElement(
  trimmed: string,
  state: MarkdownWhitespaceState,
): boolean {
  if (!RAW_TEXT_RULE.start.test(trimmed)) return false;
  state.activeHtmlBlock = endsInsideRawTextElement(trimmed)
    ? RAW_TEXT_RULE
    : null;
  return true;
}

function continueHtmlBlock(line: string, state: MarkdownWhitespaceState): void {
  const block = state.activeHtmlBlock;
  if (!block) return;
  if (block === RAW_TEXT_RULE) {
    if (!endsInsideRawTextElement(line, true)) state.activeHtmlBlock = null;
    return;
  }
  if (block.end) {
    if (block.end.test(line)) state.activeHtmlBlock = null;
    return;
  }
  if (!line.trim()) {
    state.activeHtmlBlock = null;
    return;
  }
  // A raw-text element nested in a block-level HTML block (e.g. <section><style>).
  if (endsInsideRawTextElement(line)) state.activeHtmlBlock = RAW_TEXT_RULE;
}

/**
 * Opens a raw HTML block when the line meets a CommonMark start condition.
 * Raw HTML (notably `<style>` CSS) must keep its ASCII whitespace: U+00A0 is
 * not whitespace in CSS, so converting indentation breaks selectors and
 * declarations.
 */
function tryOpenHtmlBlock(
  line: string,
  trimmed: string,
  state: MarkdownWhitespaceState,
): boolean {
  if (tryOpenRawTextElement(trimmed, state)) return true;

  const indent = getIndentWidth(line.slice(0, line.length - trimmed.length));
  if (indent > 3) return false;

  const rule = HTML_BLOCK_RULES.find(
    (candidate) =>
      candidate.start.test(trimmed) &&
      (candidate.canInterruptParagraph || !state.inParagraph),
  );
  if (!rule) return false;

  if (rule.end) {
    // Types 2-5 may close on the opening line.
    state.activeHtmlBlock = rule.end.test(trimmed) ? null : rule;
  } else {
    // Types 6-7 close at a blank line unless they open a raw-text element
    // (e.g. `<section><style>`), which stays raw until its closing tag.
    state.activeHtmlBlock = endsInsideRawTextElement(trimmed)
      ? RAW_TEXT_RULE
      : rule;
  }
  return true;
}

function resetHtmlOpenTagState(state: MarkdownWhitespaceState): void {
  state.inHtmlOpenTag = false;
  state.htmlTagQuote = null;
  state.htmlTagStandalone = false;
}

const HTML_OPEN_TAG_START = /^<([A-Za-z][A-Za-z0-9-]*)(?=[\s/>]|$)/;

type HtmlOpenTagScanResult =
  | { status: "closed"; nextIndex: number }
  | { status: "aborted"; nextIndex: number }
  | { status: "unclosed"; quote: '"' | "'" | null };

/**
 * Scans forward from inside an open HTML tag starting at `startIndex`.
 * Distinguishes a normal `>` close from an abort on an unquoted `<`, or an
 * unclosed tag at end of line (with any active quote delimiter).
 */
function scanInsideHtmlOpenTag(
  text: string,
  startIndex: number,
  initialQuote: '"' | "'" | null,
): HtmlOpenTagScanResult {
  let quote = initialQuote;
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return { status: "closed", nextIndex: i + 1 };
    } else if (ch === "<") {
      // Unquoted `<` is invalid inside an HTML open tag; abort this candidate.
      return { status: "aborted", nextIndex: i };
    }
  }
  return { status: "unclosed", quote };
}

function skipInlineCodeSpan(text: string, startIndex: number): number {
  let tickLen = 0;
  while (
    startIndex + tickLen < text.length &&
    text[startIndex + tickLen] === "`"
  ) {
    tickLen++;
  }
  const closeIdx = text.indexOf("`".repeat(tickLen), startIndex + tickLen);
  return closeIdx === -1 ? startIndex + tickLen : closeIdx + tickLen;
}

function tryScanOpenTagAt(
  text: string,
  index: number,
): HtmlOpenTagScanResult | null {
  const tagMatch = text.slice(index).match(HTML_OPEN_TAG_START);
  if (!tagMatch) return null;

  const afterName = index + tagMatch[0].length;
  // Avoid treating bare `x<y` math at EOL as an open tag.
  const isBareAtEol = afterName === text.length;
  const prevChar = index > 0 ? (text[index - 1] ?? "") : "";
  if (isBareAtEol && index > 0 && !/[\s(>[{]/.test(prevChar)) {
    return null;
  }
  return scanInsideHtmlOpenTag(text, afterName, null);
}

/**
 * Reports whether `text` (from `startIndex`) ends inside an unclosed HTML open
 * tag (e.g. `<a class="card"` or `See <a\n  href="..."`), skipping inline
 * backtick code spans.
 */
function findTrailingUnclosedHtmlOpenTag(
  text: string,
  startIndex = 0,
): { unclosed: boolean; quote: '"' | "'" | null } {
  let i = startIndex;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      i = skipInlineCodeSpan(text, i);
      continue;
    }
    if (ch === "<") {
      const scan = tryScanOpenTagAt(text, i);
      if (scan) {
        if (scan.status === "unclosed") {
          return { unclosed: true, quote: scan.quote };
        }
        i = scan.nextIndex;
        continue;
      }
    }
    i++;
  }
  return { unclosed: false, quote: null };
}

/**
 * Opens standalone multi-line HTML open-tag tracking when a line (with <= 3
 * leading spaces and not continuing a paragraph) begins with an HTML open tag
 * whose closing `>` is on a later line (e.g. `<a class="card"\n   href="...">`).
 */
function tryOpenStandaloneHtmlTag(
  line: string,
  trimmed: string,
  state: MarkdownWhitespaceState,
): boolean {
  if (state.inParagraph) return false;
  const indent = getIndentWidth(line.slice(0, line.length - trimmed.length));
  if (indent > 3) return false;

  const tagMatch = trimmed.match(HTML_OPEN_TAG_START);
  if (!tagMatch) return false;

  const scan = scanInsideHtmlOpenTag(trimmed, tagMatch[0].length, null);
  if (scan.status !== "unclosed") return false;

  state.inHtmlOpenTag = true;
  state.htmlTagQuote = scan.quote;
  state.htmlTagStandalone = true;
  return true;
}

function continueHtmlOpenTag(
  line: string,
  state: MarkdownWhitespaceState,
): void {
  const scan = scanInsideHtmlOpenTag(line, 0, state.htmlTagQuote);
  if (scan.status === "unclosed") {
    state.htmlTagQuote = scan.quote;
    return;
  }

  const trailing = line.slice(scan.nextIndex);
  const reopened = findTrailingUnclosedHtmlOpenTag(trailing);
  if (reopened.unclosed) {
    state.inHtmlOpenTag = true;
    state.htmlTagQuote = reopened.quote;
    state.htmlTagStandalone = false;
    return;
  }

  const closedStandalone =
    scan.status === "closed" &&
    state.htmlTagStandalone &&
    trailing.trim() === "";
  resetHtmlOpenTagState(state);
  state.inParagraph = !closedStandalone;
}

function transformBlockquoteLine(line: string): string | null {
  // Check for blockquote prefix (e.g. "> " or ">> "), consuming at most one space per marker
  // so additional leading indentation in `rest` is preserved.
  const blockquoteMatch = line.match(/^(\s*(?:> ?)+)(.*)$/);
  if (!blockquoteMatch) return null;

  const prefix = blockquoteMatch[1] ?? "";
  const rest = blockquoteMatch[2] ?? "";
  const leadingSpacesMatch = rest.match(/^([ \t]+)(.*)$/);
  if (!leadingSpacesMatch) return line;

  const spaces = leadingSpacesMatch[1] ?? "";
  const tail = leadingSpacesMatch[2] ?? "";
  return `${prefix}${convertLeadingSpacesToNbsp(spaces)}${tail}`;
}

function handleListLine(line: string, state: MarkdownWhitespaceState): boolean {
  const itemOffset = getListContentOffset(line);
  if (itemOffset === null) return false;

  state.listContentOffset = itemOffset;
  state.sawBlankLineInList = false;

  if (state.inFootnoteDefinition) {
    const leadingIndent = getIndentWidth(line.match(/^([ \t]*)/)?.[1] ?? "");
    if (leadingIndent < 4) {
      resetFootnoteState(state);
    } else {
      state.sawBlankLineInFootnote = false;
    }
  }
  return true;
}

function transformIndentedLine(
  line: string,
  state: MarkdownWhitespaceState,
): string | null {
  const leadingSpacesMatch = line.match(/^([ \t]+)(.*)$/);
  if (!leadingSpacesMatch) return null;

  const spaces = leadingSpacesMatch[1] ?? "";
  const rest = leadingSpacesMatch[2] ?? "";
  const indentWidth = getIndentWidth(spaces);

  // GFM footnote continuations require >= 4 spaces (or 1 tab) of real whitespace.
  if (state.inFootnoteDefinition) {
    if (indentWidth >= 4) {
      state.sawBlankLineInFootnote = false;
      return line;
    }
    if (state.sawBlankLineInFootnote) {
      resetFootnoteState(state);
    }
  }

  if (state.listContentOffset !== null) {
    // Preserve tight list continuations or loose-list paragraphs within the item's
    // CommonMark continuation range [listContentOffset, listContentOffset + 4).
    const isWithinListContinuation =
      !state.sawBlankLineInList ||
      (indentWidth >= state.listContentOffset &&
        indentWidth < state.listContentOffset + 4);
    if (isWithinListContinuation) {
      state.sawBlankLineInList = false;
      return line;
    }
    resetListState(state);
  }

  if (isIndentedBlockSyntax(spaces, rest)) {
    return line;
  }

  return `${convertLeadingSpacesToNbsp(spaces)}${rest}`;
}

function trackTrailingOpenTag(
  line: string,
  state: MarkdownWhitespaceState,
): void {
  const trailing = findTrailingUnclosedHtmlOpenTag(line);
  if (trailing.unclosed) {
    state.inHtmlOpenTag = true;
    state.htmlTagQuote = trailing.quote;
    state.htmlTagStandalone = false;
  }
}

function handleBlankLine(state: MarkdownWhitespaceState): void {
  if (state.listContentOffset !== null) {
    state.sawBlankLineInList = true;
  }
  if (state.inFootnoteDefinition) {
    state.sawBlankLineInFootnote = true;
  }
  state.inParagraph = false;
}

function tryHandlePassthroughLine(
  line: string,
  trimmed: string,
  state: MarkdownWhitespaceState,
): boolean {
  if (state.activeFence) {
    tryCloseFence(trimmed, state);
    state.inParagraph = false;
    return true;
  }
  if (state.activeHtmlBlock) {
    continueHtmlBlock(line, state);
    state.inParagraph = false;
    if (!state.activeHtmlBlock && line.trim()) {
      trackTrailingOpenTag(line, state);
    }
    return true;
  }
  if (state.inHtmlOpenTag) {
    if (line.trim()) {
      continueHtmlOpenTag(line, state);
      return true;
    }
    // A blank line ends inline HTML in CommonMark.
    resetHtmlOpenTagState(state);
  }
  if (tryOpenFence(line, trimmed, state)) {
    state.inParagraph = false;
    return true;
  }
  if (tryOpenHtmlBlock(line, trimmed, state)) {
    state.inParagraph = false;
    if (!state.activeHtmlBlock) {
      trackTrailingOpenTag(line, state);
    }
    return true;
  }
  if (!line.trim()) {
    handleBlankLine(state);
    return true;
  }
  if (tryOpenStandaloneHtmlTag(line, trimmed, state)) {
    state.inParagraph = false;
    return true;
  }
  return false;
}

function processMarkdownLine(
  line: string,
  state: MarkdownWhitespaceState,
): string {
  const trimmed = line.trimStart();

  if (tryHandlePassthroughLine(line, trimmed, state)) {
    return line;
  }

  if (isFootnoteDefinitionStart(line)) {
    state.inFootnoteDefinition = true;
    state.sawBlankLineInFootnote = false;
    resetListState(state);
    state.inParagraph = true;
    trackTrailingOpenTag(line, state);
    return line;
  }

  const blockquoteLine = transformBlockquoteLine(line);
  if (blockquoteLine !== null) {
    resetListState(state);
    resetFootnoteState(state);
    state.inParagraph = true;
    trackTrailingOpenTag(line, state);
    return blockquoteLine;
  }

  if (handleListLine(line, state)) {
    state.inParagraph = true;
    trackTrailingOpenTag(line, state);
    return line;
  }

  const indentedLine = transformIndentedLine(line, state);
  if (indentedLine !== null) {
    const leadingSpaces = line.slice(0, line.length - trimmed.length);
    state.inParagraph = !isIndentedBlockSyntax(leadingSpaces, trimmed);
    trackTrailingOpenTag(line, state);
    return indentedLine;
  }

  resetListState(state);
  resetFootnoteState(state);
  state.inParagraph = !isIndentedBlockSyntax("", trimmed);
  trackTrailingOpenTag(line, state);
  return line;
}

/**
 * Preprocesses markdown text to preserve intentional leading indentation spaces
 * and whitespace in paragraphs without triggering CommonMark indented code blocks.
 *
 * In standard CommonMark, lines with 4 spaces or tabs become code blocks,
 * and 1-3 spaces at the start of a paragraph are stripped. Converting leading
 * indentation on non-list, non-footnote lines to non-breaking spaces preserves
 * visual formatting while maintaining normal text semantics. Fenced code,
 * raw HTML blocks, and multi-line HTML open tags pass through unchanged.
 *
 * @param content - Raw markdown text input
 * @returns Preprocessed markdown with preserved paragraph indentation
 */
export function preserveMarkdownWhitespace(content: string): string {
  if (!content) return content;

  const state: MarkdownWhitespaceState = {
    activeFence: null,
    activeHtmlBlock: null,
    inHtmlOpenTag: false,
    htmlTagQuote: null,
    htmlTagStandalone: false,
    inParagraph: false,
    listContentOffset: null,
    sawBlankLineInList: false,
    inFootnoteDefinition: false,
    sawBlankLineInFootnote: false,
  };

  return content
    .split("\n")
    .map((line) => processMarkdownLine(line, state))
    .join("\n");
}
