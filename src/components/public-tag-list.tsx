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
          className="rounded-full border border-secondary-700 bg-secondary-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
