import { useTranslations } from "next-intl";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function AppViewMoreLink({ href }: { href: string }) {
  const t = useTranslations("common");
  return (
    <Link
      href={href}
      className="text-secondary flex flex-row items-center justify-end space-x-1 transition-transform hover:scale-105"
    >
      <span>{t("viewMore")}</span>
      <FaArrowRight size={16} />
    </Link>
  );
}
