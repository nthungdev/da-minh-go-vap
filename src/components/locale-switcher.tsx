"use client";

import { setLocale } from "@/actions/locale";
import Spinner from "@/components/spinner";
import { Config } from "@/payload-types";
import { defaultLocale } from "@/utils/constants";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const localeLabels: Record<Config["locale"], string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export default function LocaleSwitcher({
  initialLocale,
}: {
  initialLocale?: Config["locale"];
}) {
  const [loading, setLoading] = useState(false);
  const [locale, sLocale] = useState<Config["locale"]>(
    initialLocale || defaultLocale,
  );
  const label = localeLabels[locale];

  useEffect(() => {
    sLocale(document.documentElement.lang as Config["locale"]);
  }, []);

  async function switchLocale() {
    setLoading(true);
    await setLocale(locale === "en" ? "vi" : "en");
    window.location.reload();
  }

  return (
    <button
      className="group relative rounded px-2 py-1 hover:cursor-pointer"
      onClick={switchLocale}
    >
      <span className={loading ? "opacity-30" : ""}>{label}</span>
      <div
        className={twMerge(
          "absolute top-0 right-0 bottom-0 left-0 flex size-full items-center justify-center",
          !loading && "hidden",
        )}
      >
        <Spinner
          className={twMerge("size-4 text-white", loading ? "block" : "hidden")}
        />
      </div>
    </button>
  );
}
