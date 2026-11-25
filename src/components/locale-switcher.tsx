"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/actions/locale";
import Spinner from "@/components/spinner";
import { type Locale, localeLabels } from "@/i18n/config";
import { cn } from "@/utils/common";

export default function LocaleSwitcher() {
  const t = useTranslations("navigation");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const nextLocale = (locale === "en" ? "vi" : "en") as Locale;
  const label = localeLabels[nextLocale];

  async function switchLocale() {
    startTransition(async () => {
      await setLocale(nextLocale);
      // The action's own response re-renders the locale route chosen before
      // the cookie changed; a refresh re-runs the cookie-based rewrite.
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="relative inline-flex min-h-11 items-center justify-center rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:cursor-pointer hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:pointer-events-none sm:min-h-9"
      onClick={switchLocale}
      disabled={isPending}
      aria-label={t("switchLocale", { language: label })}
    >
      <span className={cn(isPending && "opacity-30")}>{label}</span>
      <div
        className={cn(
          "absolute top-0 right-0 bottom-0 left-0 flex size-full items-center justify-center",
          !isPending && "hidden",
        )}
      >
        <Spinner
          className={cn("size-4 text-white", isPending ? "block" : "hidden")}
        />
      </div>
    </button>
  );
}
