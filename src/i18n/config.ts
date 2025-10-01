export type Locale = (typeof locales)[number];

export const locales = ["en", "vi"] as const;
export const defaultLocale: Locale = "vi";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};
