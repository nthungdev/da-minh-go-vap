"use server";

import { Locale } from "@/i18n/config";
import { cookies } from "next/headers";

export async function setLocale(locale: Locale) {
  const c = await cookies();
  c.set("locale", locale, { path: "/" });
}
