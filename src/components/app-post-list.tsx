import { AppPost, PostParams } from "@/definitions";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

function DefaultItemComponent({ post }: { post: AppPost }) {
  return (
    <Link href={`/posts/${post.slug}`} className="w-full">
      <div className="w-full overflow-hidden rounded-lg border-2 hover:ring-2">
        {typeof post.thumbnail !== "string" &&
          typeof post.thumbnail?.url === "string" && (
            <Image
              className="aspect-video w-full object-cover"
              src={post.thumbnail.url}
              width={256}
              height={144}
              alt={`${post.title}'s thumbnail`}
            />
          )}
        <div className="space-y-2 p-2">
          <h2 className="block truncate text-center text-xl">{post.title}</h2>
          <button className="block w-full text-center">Xem tiếp...</button>
        </div>
      </div>
    </Link>
  );
}

interface AppPostListProps {
  posts: PostParams[];
  className?: string;
  itemComponent?: React.ElementType;
}

export default function AppPostList(props: AppPostListProps) {
  const { posts, className, itemComponent } = props;
  const ItemComponent = itemComponent ? itemComponent : DefaultItemComponent;

  return (
    <ul
      className={twMerge("relative flex flex-col gap-4 rounded-xs", className)}
    >
      {posts.map((post, index) => (
        <li className="block w-full" key={index}>
          <ItemComponent post={post} />
        </li>
      ))}
    </ul>
  );
}
