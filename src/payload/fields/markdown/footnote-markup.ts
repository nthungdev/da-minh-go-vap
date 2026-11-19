/**
 * Computes the next sequential numeric footnote ID (`1`-based) from existing `[^n]`
 * references or definitions in the markdown content.
 */
export function getNextFootnoteNumber(markdown: string): number {
  let maxNumber = 0;
  for (const match of markdown.matchAll(/\[\^(\d+)\]/g)) {
    const parsed = Number.parseInt(match[1] ?? "", 10);
    if (Number.isFinite(parsed) && parsed > maxNumber) {
      maxNumber = parsed;
    }
  }
  return maxNumber + 1;
}

export interface FootnoteInsertionResult {
  footnoteNumber: number;
  nextValue: string;
  replacementStart: number;
  replacementText: string;
}

/**
 * Inserts `[^n]` at the cursor position and appends `[^n]: ` at the bottom of
 * the markdown content with clean blank-line separation.
 */
export function insertFootnoteMarkup(
  markdown: string,
  cursorEnd: number,
): FootnoteInsertionResult {
  const footnoteNumber = getNextFootnoteNumber(markdown);
  const clampedPos = Math.max(0, Math.min(cursorEnd, markdown.length));
  const marker = `[^${footnoteNumber}]`;
  const withMarker =
    markdown.slice(0, clampedPos) + marker + markdown.slice(clampedPos);

  let separator = "\n\n";
  if (withMarker.endsWith("\n\n")) {
    separator = "";
  } else if (withMarker.endsWith("\n")) {
    separator = "\n";
  }

  const nextValue = `${withMarker}${separator}[^${footnoteNumber}]: `;
  return {
    footnoteNumber,
    nextValue,
    replacementStart: clampedPos,
    replacementText: nextValue.slice(clampedPos),
  };
}
