import CopyButton from "@/components/copy-button";
import { Locale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { FaViber } from "react-icons/fa";
import { RiFacebookFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

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
      <div className={twMerge("mt-1 flex flex-row gap-2")}>
        <CopyButton
          text={shareUrl}
          className="hover:border-primary cursor-pointer rounded-full border p-2"
        />
        <Link
          href={facebookHref}
          target="_blank"
          className="hover:border-primary cursor-pointer rounded-full border p-2 text-[#1877F2]"
        >
          <RiFacebookFill />
        </Link>
        <Link
          href={viberHref}
          className="hover:border-primary rounded-full border p-2 text-[#7360f2]"
        >
          <FaViber />
        </Link>
      </div>
    </div>
  );
}
