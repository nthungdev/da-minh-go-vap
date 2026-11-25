import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppPost } from "@/definitions";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { formatShortDate } from "@/utils/date";

interface AppPostCardProps {
  post: AppPost;
  className?: string;
  showDate?: boolean;
}

export default function AppPostCard(props: AppPostCardProps) {
  const { post, className, showDate } = props;
  const locale = useLocale();

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group flex h-full w-full min-w-0 flex-col gap-x-2 overflow-hidden rounded-xl border border-transparent bg-surface text-base transition-colors duration-200 hover:border-border hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:bg-accent motion-reduce:transition-none lg:flex-row",
        className,
      )}
    >
      <div className="relative aspect-video shrink-0 overflow-hidden rounded-xl bg-surface-muted lg:h-full lg:w-auto">
        {typeof post.thumbnail !== "string" &&
          typeof post.thumbnail.url === "string" && (
            <Image
              unoptimized
              src={transformUrl(post.thumbnail.url, {
                width: "400",
                quality: "80",
              })}
              alt={post.title}
              loading="lazy"
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover"
            />
          )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-y-1 overflow-hidden px-1.5 py-1 md:py-1.5 lg:px-0 lg:py-1.5">
        <span className="line-clamp-2 text-sm font-semibold break-words text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none lg:line-clamp-2">
          {post.title}
        </span>
        {showDate && (
          <span className="line-clamp-1 text-xs text-foreground-muted">
            {formatShortDate(post.publishedAt, locale)}
          </span>
        )}
      </div>
    </Link>
  );
}
