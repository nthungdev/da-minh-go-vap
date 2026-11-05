const WRAPPING_QUOTES = /^[\s"“”„«»]+|[\s"“”„«»]+$/g;

/**
 * Removes quote marks wrapping a pasted quotation, so views that add their
 * own typographic quotes don't render them twice.
 */
export function stripWrappingQuotes(text: string): string {
  return text.replace(WRAPPING_QUOTES, "");
}
