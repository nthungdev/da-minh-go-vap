import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HTMLAttributes } from "react";
import { FaViber } from "react-icons/fa";
import { RiFacebookFill } from "react-icons/ri";
import CopyButton from "@/components/copy-button";
import type { Locale } from "@/i18n/config";
import { cn } from "@/utils/common";

const shareControlClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-primary-800 focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:ring-offset-2 focus-visible:outline-none";

function buildFacebookShareUrl(url: string) {
  const params = new URLSearchParams();
  params.append("u", url);
  params.append("src", "sdkprepare");
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

interface ShareToolbarProps extends HTMLAttributes<HTMLDivElement> {
  shareUrl: string;
  locale?: Locale;
}

export default async function ShareToolbar({
  shareUrl,
  className,
  locale,
}: ShareToolbarProps) {
  const viberHref = `viber://forward?text=${shareUrl}`;
  // Facebook doesn't seem to recognize localhost url, so it won't work in local
  const facebookHref = buildFacebookShareUrl(shareUrl);

  const t = locale
    ? await getTranslations({ locale, namespace: "shareToolbar" })
    : await getTranslations("shareToolbar");

  return (
    <div className={className}>
      <div>{t("title")}</div>
      <div className={cn("mt-1 flex flex-row gap-2")}>
        <CopyButton
          text={shareUrl}
          className={cn(shareControlClassName, "cursor-pointer")}
        />
        <Link
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("shareFacebook")}
          className={cn(shareControlClassName, "text-[#1877F2]")}
        >
          <RiFacebookFill aria-hidden="true" />
        </Link>
        <Link
          href={viberHref}
          aria-label={t("shareViber")}
          className={cn(shareControlClassName, "text-[#7360f2]")}
        >
          <FaViber aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
