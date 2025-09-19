"use server";

import { Config } from "@/payload-types";
import { cookies } from "next/headers";

export async function setLocale(locale: Config["locale"]) {
  const c = await cookies();
  c.set("locale", locale, { path: "/" });
}
