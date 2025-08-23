import { AppPost } from "@/definitions";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface AppPostListItemProps {
  post: AppPost;
  className?: string;
}

export default function AppPostListItem(props: AppPostListItemProps) {
  const { post, className } = props;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={twMerge("@container block h-full w-full", className)}
    >
      <div className="flex aspect-[3.5] h-full w-full flex-row gap-x-2 overflow-hidden hover:cursor-pointer hover:ring-2">
        <div className="relative aspect-video h-full w-auto overflow-hidden bg-gray-300">
          {typeof post.thumbnail !== "string" &&
            typeof post.thumbnail?.url === "string" && (
              <Image
                src={post.thumbnail.url}
                alt={post.title}
                fill
                sizes="100%"
                className="object-cover"
              />
            )}
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-hidden py-2">
          <span className="line-clamp-2 text-base text-gray-900">
            {post.title}
          </span>
        </div>
      </div>
    </Link>
  );
}
