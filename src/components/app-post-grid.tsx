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
        <li className="min-w-0" key={post.slug}>
          <Link
            prefetch={false}
            href={`/posts/${post.slug}`}
            className="group block size-full overflow-hidden rounded-xl border border-border bg-white shadow-xs transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
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
              <div className="p-3 text-left text-base leading-snug font-semibold text-gray-900 group-hover:text-primary-800">
                <span className="line-clamp-3">{post.title}</span>
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
