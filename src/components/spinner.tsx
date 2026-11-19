import { useTranslations } from "next-intl";
import { cn } from "@/utils/common";

export default function Spinner({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("common");
  return (
    <div
      className={cn(
        "text-primary-600 inline-block size-6 animate-spin rounded-full border-3 border-current border-t-transparent",
        className,
      )}
      role="status"
      aria-label={t("loading")}
      {...props}
    >
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
