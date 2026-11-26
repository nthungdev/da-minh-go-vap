import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HTMLAttributes } from "react";
import CopyButton from "@/components/copy-button";
import type { Locale } from "@/i18n/config";
import { cn } from "@/utils/common";

const shareControlClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border bg-surface text-foreground transition-colors duration-150 hover:border-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary-100 motion-reduce:transition-none";

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
      <div className="text-sm font-medium text-foreground-muted">
        {t("title")}
      </div>
      <div className="mt-1.5 flex flex-row flex-wrap gap-2">
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
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 fill-current"
          >
            <path d="M14 22v-9h3l.5-3H14V8c0-1 .3-2 2-2h2V3a17 17 0 0 0-2.8-.2C12.3 2.8 10 4.6 10 8v2H7v3h3v9z" />
          </svg>
        </Link>
        <Link
          href={viberHref}
          aria-label={t("shareViber")}
          className={cn(shareControlClassName, "text-[#7360f2]")}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 fill-current"
          >
            <path
              fillRule="evenodd"
              d="M8 2a6 6 0 0 0-6 6v5a6 6 0 0 0 4 5.7V22l4-3h6a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6zm-.7 5.1 1-.6a1 1 0 0 1 1.3.3l1.3 1.8a1 1 0 0 1-.1 1.3l-.7.7a8 8 0 0 0 2.7 2.7l.7-.7a1 1 0 0 1 1.3-.1l1.8 1.3a1 1 0 0 1 .3 1.3l-.6 1c-.4.7-1.3 1-2 .8a12 12 0 0 1-7.8-7.8c-.2-.8.1-1.6.8-2zm5.6-.9a.6.6 0 0 0 0 1.2 3.7 3.7 0 0 1 3.7 3.7.6.6 0 0 0 1.2 0 4.9 4.9 0 0 0-4.9-4.9zm0 2.2a.6.6 0 0 0 0 1.2 1.5 1.5 0 0 1 1.5 1.5.6.6 0 0 0 1.2 0 2.7 2.7 0 0 0-2.7-2.7z"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
