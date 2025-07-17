"use client";

import { fetchPostsByHiddenTags } from "@/actions/post";
import AppPostCard from "@/components/app-post-card";
import AppSectionHeader from "@/components/app-section-header";
import { AppPost, PostParams } from "@/definitions";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

function DefaultItemComponent({ post }: { post: PostParams }) {
  return (
    <Link href={`/posts/${post.slug}`} className="w-full">
      <div className="w-full rounded-lg overflow-hidden border-2 hover:ring-2">
        {typeof post.thumbnail !== "string" &&
          typeof post.thumbnail.url === "string" && (
            <Image
              className="w-full aspect-video object-cover"
              src={post.thumbnail.url}
              width={256}
              height={144}
              alt={`${post.title}'s thumbnail`}
            />
          )}
        <div className="p-2 space-y-2">
          <h2 className="text-center truncate block text-xl">{post.title}</h2>
          <button className="w-full text-center block">Xem tiếp...</button>
        </div>
      </div>
    </Link>
  );
}

interface AppPostListAsyncProps {
  hiddenTags: string[];
  limit: number;
  title?: string;
  posts?: AppPost[];
  itemComponent?: React.ElementType;
}

export default function AppPostListAsync({
  hiddenTags,
  limit,
  title,
  posts,
  itemComponent,
}: AppPostListAsyncProps) {
  const ItemComponent = itemComponent ? itemComponent : AppPostCard;

  const { data, error, isPending } = useQuery({
    queryKey: ["fetchPostsByHiddenTags", hiddenTags],
    queryFn: async () => {
      const posts = await fetchPostsByHiddenTags(hiddenTags, { limit });
      return posts;
    },
    initialData: { posts: posts || [], hasMore: false },
  });

  // TODO make skeleton component
  if (isPending) return null;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {title && (
        <AppSectionHeader className="uppercase">{title}</AppSectionHeader>
      )}
      <ul className="relative flex flex-col gap-2 rounded-sm p-2">
        {data.posts.map((post, index) => (
          <li className="block w-full" key={index}>
            <ItemComponent post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
