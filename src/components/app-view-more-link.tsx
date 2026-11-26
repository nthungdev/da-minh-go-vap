import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AppViewMoreLink({ href }: { href: string }) {
  const t = useTranslations("common");
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-secondary transition-colors duration-200 hover:text-secondary-800 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:text-secondary-900 motion-reduce:transition-none"
    >
      <span>{t("viewMore")}</span>
      <ArrowRight
        className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );
}
