import AppPage from "@/components/app-page";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <AppPage className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-4">{t("description")}</p>
      <Link href="/" className="mt-10">
        {t("backHome")}
      </Link>
    </AppPage>
  );
}
