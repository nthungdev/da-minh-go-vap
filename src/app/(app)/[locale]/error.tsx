"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import AppPageContent from "@/components/app-page/app-page-content";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/state-feedback";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error("Unable to render the page", error);
  }, [error]);

  return (
    <AppPageContent className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <ErrorState
        title={t("title")}
        description={t("description")}
        retryLabel={t("retry")}
        onRetry={reset}
      />
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "min-h-11 px-5",
        })}
      >
        {t("backHome")}
      </Link>
    </AppPageContent>
  );
}
