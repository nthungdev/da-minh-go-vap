import { defaultLocale } from "@/utils/constants";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("locale")?.value || defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
