export interface KeywordMarkupInput {
  phrase: string;
  title: string;
  description: string;
  image?: string;
  href?: string;
}

/** Escapes a value for a double-quoted HTML attribute, collapsing line breaks so the tag stays inline in Markdown. */
export function escapeAttribute(value: string): string {
  return value
    .replace(/\s*\r?\n\s*/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

/** Builds a single-line `<keyword>` tag using the documented `data-*` attributes, omitting empty optional ones. */
export function buildKeywordMarkup({
  phrase,
  title,
  description,
  image,
  href,
}: KeywordMarkupInput): string {
  const attributes: [string, string | undefined][] = [
    ["data-title", title],
    ["data-description", description],
    ["data-image", image],
    ["data-href", href],
  ];
  const serialized = attributes
    .map(([name, value]) => [name, value ? escapeAttribute(value) : ""])
    .filter(([, value]) => value !== "")
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");

  // A blank line inside inline HTML ends the Markdown paragraph, so keep the phrase on one line.
  const inlinePhrase = phrase.replace(/\s*\r?\n\s*/g, " ").trim();
  return `<keyword ${serialized}>${inlinePhrase}</keyword>`;
}
