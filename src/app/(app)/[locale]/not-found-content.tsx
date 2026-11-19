"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFoundContent() {
  const t = useTranslations("notFound");
  return (
    <>
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-4">{t("description")}</p>
      <Link href="/" className="mt-10">
        {t("backHome")}
      </Link>
    </>
  );
}
