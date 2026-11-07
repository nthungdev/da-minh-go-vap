"use client";

import { setLocale } from "@/actions/locale";
import Spinner from "@/components/spinner";
import { Locale, localeLabels } from "@/i18n/config";
import { cn } from "@/utils/common";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const nextLocale = (locale === "en" ? "vi" : "en") as Locale;
  const label = localeLabels[nextLocale];

  async function switchLocale() {
    startTransition(async function () {
      await setLocale(nextLocale);
      router.refresh();
    });
  }

  return (
    <button
      className="group relative rounded px-2 py-1 hover:cursor-pointer disabled:pointer-events-none"
      onClick={switchLocale}
      disabled={isPending}
      aria-label={`Switch language to ${label}`}
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
