import { defaultLocale, locales } from "@/i18n/config";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get("locale")?.value;
  // The cookie is client-controlled; an unknown value would break the dynamic messages import.
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
