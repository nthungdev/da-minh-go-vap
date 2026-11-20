import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import type { HiddenTag } from "@/payload-types";
import { cn } from "@/utils/common";
import { makePublicTagPath } from "@/utils/post";

export function PublicTagList({
  className,
  tags,
  ...props
}: ComponentProps<"div"> & { tags: HiddenTag[] }) {
  const t = useTranslations("posts");
  return (
    <div
      className={cn("mt-6 flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      <span className="text-sm font-medium text-gray-600">{t("tags")}</span>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={makePublicTagPath(tag.tag)}
          className="border:bg-secondary-300 rounded-full border bg-secondary-400 px-3 py-1 text-sm text-white transition hover:bg-secondary-600"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
