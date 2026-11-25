import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AppViewMoreLink({ href }: { href: string }) {
  const t = useTranslations("common");
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-2 font-semibold text-secondary transition-colors hover:text-secondary-800 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
    >
      <span>{t("viewMore")}</span>
      <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}
