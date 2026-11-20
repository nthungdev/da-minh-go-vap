"use server";

import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { type Locale, locales } from "@/i18n/config";

export async function setLocale(locale: Locale) {
  // Server actions are public endpoints; the type annotation is not enforced at runtime.
  if (!hasLocale(locales, locale)) {
    throw new Error("Unsupported locale");
  }
  const c = await cookies();
  c.set("locale", locale, { path: "/" });
}
