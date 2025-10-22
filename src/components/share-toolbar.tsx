import CopyButton from "@/components/copy-button";
import { getMessages } from "next-intl/server";
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
}

export default async function ShareToolbar({
  shareUrl,
  className,
}: ShareToolbarProps) {
  const viberHref = `viber://forward?text=${shareUrl}`;
  const facebookHref = buildFacebookShareUrl(shareUrl);

  const messages = await getMessages();

  return (
    <div className={className}>
      <div>{messages.shareToolbar.title}</div>
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
