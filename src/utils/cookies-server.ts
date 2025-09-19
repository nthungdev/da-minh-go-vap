import { defaultLocale } from "@/utils/constants";
import { cookies } from "next/headers";

export async function getServerCookies() {
  const c = await cookies();
  return c.get("locale")?.value || defaultLocale;
}
