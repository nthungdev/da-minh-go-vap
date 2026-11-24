"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFoundContent() {
  const t = useTranslations("notFound");
  return (
    <>
      <h1 className="text-center text-4xl font-bold text-stone-900">
        {t("title")}
      </h1>
      <p className="mt-4 text-center text-muted-foreground">
        {t("description")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-primary-900 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        {t("backHome")}
      </Link>
    </>
  );
}
