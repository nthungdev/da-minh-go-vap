const OPENING_QUOTE = /^\s*["“”„«»]/;
const CLOSING_QUOTE = /["“”„«»]\s*$/;

/**
 * Removes one pair of quote marks wrapping a pasted quotation, so views that
 * add their own typographic quotes don't render them twice. Text that doesn't
 * both start and end with a quote mark is only trimmed, so a closing quote
 * that belongs to an inner quotation survives.
 */
export function stripWrappingQuotes(text: string): string {
  if (!OPENING_QUOTE.test(text) || !CLOSING_QUOTE.test(text)) {
    return text.trim();
  }
  return text.replace(OPENING_QUOTE, "").replace(CLOSING_QUOTE, "").trim();
}
