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

  const lines = content.split("\n");
  let activeFence: { char: string; length: number } | null = null;
  let listContentOffset: number | null = null;
  let sawBlankLineInList = false;
  let inFootnoteDefinition = false;
  let sawBlankLineInFootnote = false;

  const processedLines = lines.map((line) => {
    const trimmed = line.trimStart();

    if (activeFence) {
      const closeMatch = trimmed.match(/^(`{3,}|~{3,})[ \t]*$/);
      const closeMarker = closeMatch?.[1];
      if (
        closeMarker &&
        closeMarker[0] === activeFence.char &&
        closeMarker.length >= activeFence.length
      ) {
        activeFence = null;
      }
      return line;
    }

    const openMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    const openMarker = openMatch?.[1];
    const openInfo = openMatch?.[2] ?? "";
    if (openMarker && (openMarker[0] === "~" || !openInfo.includes("`"))) {
      const fenceIndent = getIndentWidth(
        line.slice(0, line.length - trimmed.length),
      );
      if (listContentOffset !== null && fenceIndent < listContentOffset) {
        listContentOffset = null;
        sawBlankLineInList = false;
      }
      if (inFootnoteDefinition && fenceIndent < 4) {
        inFootnoteDefinition = false;
        sawBlankLineInFootnote = false;
      }
      activeFence = {
        char: openMarker[0] ?? "`",
        length: openMarker.length,
      };
      return line;
    }

    // Do not transform empty or whitespace-only lines
    if (!line.trim()) {
      if (listContentOffset !== null) {
        sawBlankLineInList = true;
      }
      if (inFootnoteDefinition) {
        sawBlankLineInFootnote = true;
      }
      return line;
    }

    if (isFootnoteDefinitionStart(line)) {
      inFootnoteDefinition = true;
      sawBlankLineInFootnote = false;
      listContentOffset = null;
      sawBlankLineInList = false;
      return line;
    }

    // Check for blockquote prefix (e.g. "> " or ">> "), consuming at most one space per marker
    // so additional leading indentation in `rest` is preserved.
    const blockquoteMatch = line.match(/^(\s*(?:> ?)+)(.*)$/);
    if (blockquoteMatch) {
      listContentOffset = null;
      sawBlankLineInList = false;
      inFootnoteDefinition = false;
      sawBlankLineInFootnote = false;
      const prefix = blockquoteMatch[1] ?? "";
      const rest = blockquoteMatch[2] ?? "";
      const leadingSpacesMatch = rest.match(/^([ \t]+)(.*)$/);
      if (leadingSpacesMatch) {
        const spaces = leadingSpacesMatch[1] ?? "";
        const tail = leadingSpacesMatch[2] ?? "";
        return `${prefix}${convertLeadingSpacesToNbsp(spaces)}${tail}`;
      }
      return line;
    }

    const itemOffset = getListContentOffset(line);
    if (itemOffset !== null) {
      listContentOffset = itemOffset;
      sawBlankLineInList = false;
      if (
        inFootnoteDefinition &&
        getIndentWidth(line.match(/^([ \t]*)/)?.[1] ?? "") < 4
      ) {
        inFootnoteDefinition = false;
        sawBlankLineInFootnote = false;
      } else if (inFootnoteDefinition) {
        sawBlankLineInFootnote = false;
      }
      return line;
    }

    // Check for leading spaces/tabs on regular lines
    const leadingSpacesMatch = line.match(/^([ \t]+)(.*)$/);
    if (leadingSpacesMatch) {
      const spaces = leadingSpacesMatch[1] ?? "";
      const rest = leadingSpacesMatch[2] ?? "";
      const indentWidth = getIndentWidth(spaces);

      // GFM footnote continuations require >= 4 spaces (or 1 tab) of real whitespace.
      if (inFootnoteDefinition) {
        if (indentWidth >= 4) {
          sawBlankLineInFootnote = false;
          return line;
        }
        if (sawBlankLineInFootnote) {
          inFootnoteDefinition = false;
          sawBlankLineInFootnote = false;
        }
      }

      if (listContentOffset !== null) {
        // Preserve tight list continuations or loose-list paragraphs within the item's
        // CommonMark continuation range [listContentOffset, listContentOffset + 4).
        if (
          !sawBlankLineInList ||
          (indentWidth >= listContentOffset &&
            indentWidth < listContentOffset + 4)
        ) {
          sawBlankLineInList = false;
          return line;
        }
        listContentOffset = null;
        sawBlankLineInList = false;
      }

      if (isIndentedBlockSyntax(spaces, rest)) {
        return line;
      }

      return `${convertLeadingSpacesToNbsp(spaces)}${rest}`;
    }

    listContentOffset = null;
    sawBlankLineInList = false;
    inFootnoteDefinition = false;
    sawBlankLineInFootnote = false;
    return line;
  });

  return processedLines.join("\n");
}
