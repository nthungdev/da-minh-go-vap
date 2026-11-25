/** Formats a date with a long month name in English or Vietnamese. */
export function formatDate(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Formats a numeric date in English or Vietnamese. */
export function formatShortDate(date: Date, locale?: string) {
  return date.toLocaleDateString(locale === "en" ? "en-US" : "vi-VN");
}
