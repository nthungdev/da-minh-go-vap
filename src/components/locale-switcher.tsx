import { setLocale } from "@/actions/locale";
import { Config } from "@/payload-types";
import { defaultLocale } from "@/utils/constants";
import { useEffect, useState } from "react";

const localeLabels: Record<Config["locale"], string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export default function LocaleSwitcher({
  initialLocale,
}: {
  initialLocale?: Config["locale"];
}) {
  const [locale, sLocale] = useState<Config["locale"]>(
    initialLocale || defaultLocale,
  );
  const label = localeLabels[locale];

  useEffect(() => {
    sLocale(document.documentElement.lang as Config["locale"]);
  }, []);

  async function switchLocale() {
    await setLocale(locale === "en" ? "vi" : "en");
    window.location.reload();
  }

  return (
    <button
      className="group rounded px-2 py-1 hover:cursor-pointer"
      onClick={switchLocale}
    >
      {label}
    </button>
  );
}
