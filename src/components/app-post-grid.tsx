import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { HTMLAttributes } from "react";
import type { AppPost } from "@/definitions";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface AppPostGridProps extends HTMLAttributes<HTMLElement> {
  posts: AppPost[];
  hidePostTitles?: boolean;
}

export default function AppPostGrid({
  posts,
  hidePostTitles,
  className,
}: AppPostGridProps) {
  const t = useTranslations("common");
  return (
    <ul
      className={cn(
        "app-post-grid relative grid grid-flow-row gap-4 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {posts.map((post) => (
        // min-w-0 to override min-width: min-content that cause post title to not be truncated
        <li
          className="block size-full min-w-0 border border-transparent bg-white hover:ring-3"
          key={post.slug}
        >
          <Link
            prefetch={false}
            href={`/posts/${post.slug}`}
            className="block size-full overflow-hidden border border-gray-300"
          >
            <div className="relative aspect-video">
              {typeof post.thumbnail !== "string" &&
                typeof post.thumbnail.url === "string" && (
                  <Image
                    unoptimized
                    className="object-cover"
                    src={transformUrl(post.thumbnail.url, {
                      width: "400",
                      quality: "80",
                    })}
                    loading="lazy"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    alt={t("thumbnailAlt", { title: post.title })}
                  />
                )}
            </div>
            {!hidePostTitles && (
              <div className="line-clamp-3 w-full space-y-2 p-1.5 text-center text-base lg:text-lg">
                {post.title}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
