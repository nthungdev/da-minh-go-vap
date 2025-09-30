import { AppPost } from "@/definitions";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface AppPostCardProps {
  post: AppPost;
  className?: string;
  showDate?: boolean;
}

export default function AppPostCard(props: AppPostCardProps) {
  const { post, className, showDate } = props;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={twMerge(
        "flex h-full w-full flex-col gap-x-2 overflow-hidden border border-transparent text-base hover:cursor-pointer hover:ring-3 lg:flex-row",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden lg:h-full lg:w-auto">
        {typeof post.thumbnail !== "string" &&
          typeof post.thumbnail.url === "string" && (
            <Image
              src={post.thumbnail.url}
              alt={post.title}
              fill
              sizes="100%"
              className="object-cover"
            />
          )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-y-1 overflow-hidden px-1.5 py-1 md:py-1.5 lg:px-0 lg:py-1.5">
        <span className="font-header line-clamp-2 text-sm text-gray-900 lg:line-clamp-2">
          {post.title}
        </span>
        {showDate && (
          <span className="font-header line-clamp-1 text-xs text-gray-500">
            {post.publishedAt.toLocaleDateString("vi-VN")}
          </span>
        )}
      </div>
    </Link>
  );
}
