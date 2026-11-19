"use server";

import { Locale, locales } from "@/i18n/config";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";

export async function setLocale(locale: Locale) {
  // Server actions are public endpoints; the type annotation is not enforced at runtime.
  if (!hasLocale(locales, locale)) {
    throw new Error("Unsupported locale");
  }
  const c = await cookies();
  c.set("locale", locale, { path: "/" });
}
