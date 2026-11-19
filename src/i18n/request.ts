import { defaultLocale } from "@/i18n/config";
import { isLocale } from "@/i18n/routing";
import { getRequestConfig } from "next-intl/server";

// The locale comes from the `[locale]` route segment (filled by the
// next.config rewrites) instead of the cookie, so public pages can render
// statically. An unknown value would break the dynamic messages import.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
