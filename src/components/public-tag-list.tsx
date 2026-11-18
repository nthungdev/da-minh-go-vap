import { HiddenTag } from "@/payload-types";
import { makePublicTagPath } from "@/utils/post";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function PublicTagList({
  className,
  tags,
  ...props
}: ComponentProps<"div"> & { tags: HiddenTag[] }) {
  const t = useTranslations("posts");
  return (
    <div
      className={twMerge("mt-6 flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      <span className="text-sm font-medium text-gray-600">{t("tags")}</span>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={makePublicTagPath(tag.tag)}
          className="border:bg-secondary-300 bg-secondary-400 hover:bg-secondary-600 rounded-full border px-3 py-1 text-sm text-white transition"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
