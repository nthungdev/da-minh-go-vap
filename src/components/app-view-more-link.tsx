import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaArrowRight } from "react-icons/fa";

export default function AppViewMoreLink({ href }: { href: string }) {
  const t = useTranslations("common");
  return (
    <Link
      href={href}
      className="flex flex-row items-center justify-end space-x-1 text-secondary transition-transform hover:scale-105"
    >
      <span>{t("viewMore")}</span>
      <FaArrowRight size={16} />
    </Link>
  );
}
