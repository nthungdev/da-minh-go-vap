import Image from "next/image";
import Link from "next/link";
import type { AppPost } from "@/definitions";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface AppPostListItemProps {
  post: AppPost;
  className?: string;
}

export default function AppPostListItem(props: AppPostListItemProps) {
  const { post, className } = props;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "app-post-list-item @container block h-full w-full rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex aspect-[3.5] h-full w-full flex-row gap-x-2 overflow-hidden rounded-lg bg-surface transition-colors hover:cursor-pointer hover:bg-surface-muted hover:ring-2 hover:ring-ring motion-reduce:transition-none">
        <div className="relative aspect-video h-full w-auto overflow-hidden bg-surface-muted">
          {typeof post.thumbnail !== "string" &&
            typeof post.thumbnail?.url === "string" && (
              <Image
                unoptimized
                src={transformUrl(post.thumbnail.url)}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 33vw, 10vw"
                className="object-cover"
              />
            )}
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-hidden py-2">
          <span className="line-clamp-2 text-base text-foreground">
            {post.title}
          </span>
        </div>
      </div>
    </Link>
  );
}
