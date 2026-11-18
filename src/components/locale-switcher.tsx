"use client";

import { setLocale } from "@/actions/locale";
import Spinner from "@/components/spinner";
import { Locale } from "@/i18n/config";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { twMerge } from "tailwind-merge";

const localeLabels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const nextLocale = locale === "en" ? "vi" : "en";
  const label = localeLabels[nextLocale];

  async function switchLocale() {
    startTransition(async function () {
      await setLocale(nextLocale);
      // The action's own response re-renders the locale route chosen before
      // the cookie changed; a refresh re-runs the cookie-based rewrite.
      router.refresh();
    });
  }

  return (
    <button
      className="group relative rounded px-2 py-1 hover:cursor-pointer"
      onClick={switchLocale}
    >
      <span className={isPending ? "opacity-30" : ""}>{label}</span>
      <div
        className={twMerge(
          "absolute top-0 right-0 bottom-0 left-0 flex size-full items-center justify-center",
          !isPending && "hidden",
        )}
      >
        <Spinner
          className={twMerge(
            "size-4 text-white",
            isPending ? "block" : "hidden",
          )}
        />
      </div>
    </button>
  );
}
