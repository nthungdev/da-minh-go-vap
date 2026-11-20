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

interface MarkdownWhitespaceState {
  activeFence: { char: string; length: number } | null;
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

function processMarkdownLine(
  line: string,
  state: MarkdownWhitespaceState,
): string {
  const trimmed = line.trimStart();

  if (state.activeFence) {
    tryCloseFence(trimmed, state);
    return line;
  }

  if (tryOpenFence(line, trimmed, state)) {
    return line;
  }

  // Do not transform empty or whitespace-only lines
  if (!line.trim()) {
    if (state.listContentOffset !== null) {
      state.sawBlankLineInList = true;
    }
    if (state.inFootnoteDefinition) {
      state.sawBlankLineInFootnote = true;
    }
    return line;
  }

  if (isFootnoteDefinitionStart(line)) {
    state.inFootnoteDefinition = true;
    state.sawBlankLineInFootnote = false;
    resetListState(state);
    return line;
  }

  const blockquoteLine = transformBlockquoteLine(line);
  if (blockquoteLine !== null) {
    resetListState(state);
    resetFootnoteState(state);
    return blockquoteLine;
  }

  if (handleListLine(line, state)) {
    return line;
  }

  const indentedLine = transformIndentedLine(line, state);
  if (indentedLine !== null) {
    return indentedLine;
  }

  resetListState(state);
  resetFootnoteState(state);
  return line;
}

/**
 * Preprocesses markdown text to preserve intentional leading indentation spaces
 * and whitespace in paragraphs without triggering CommonMark indented code blocks.
 *
 * In standard CommonMark, lines with 4 spaces or tabs become code blocks,
 * and 1-3 spaces at the start of a paragraph are stripped. Converting leading
 * indentation on non-list, non-footnote lines to non-breaking spaces preserves
 * visual formatting while maintaining normal text semantics.
 *
 * @param content - Raw markdown text input
 * @returns Preprocessed markdown with preserved paragraph indentation
 */
export function preserveMarkdownWhitespace(content: string): string {
  if (!content) return content;

  const state: MarkdownWhitespaceState = {
    activeFence: null,
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
