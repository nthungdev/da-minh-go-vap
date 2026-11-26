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
      <span className="text-sm font-medium text-foreground-muted">
        {t("tags")}
      </span>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={makePublicTagPath(tag.tag)}
          className="inline-flex max-w-full items-center rounded-pill border border-secondary bg-secondary px-3 py-1.5 text-sm font-medium break-words text-secondary-foreground transition-colors duration-150 hover:border-secondary-800 hover:bg-secondary-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:border-secondary-900 active:bg-secondary-900 motion-reduce:transition-none"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
