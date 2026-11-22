import type { ComponentProps } from "react";
import AppPostGridAsync from "@/components/app-post-grid-async";
import AppPostListAsync from "@/components/app-post-list-async";
import type { AppPost } from "@/definitions";
import type { PaginatedPostsData } from "@/utils/post-pagination";

interface PostGroupProps extends ComponentProps<"div"> {
  hiddenTags: string[];
  limit: number;
  type: "grid" | "list";
  title?: string;
  posts?: AppPost[];
  initialPosts?: AppPost[];
  initialData?: PaginatedPostsData;
  hasMore?: boolean;
  hidePostTitles?: boolean;
}

export default function PostGroup(props: PostGroupProps) {
  const posts = props.initialPosts ?? props.posts;

  if (props.type === "grid") {
    return (
      <AppPostGridAsync
        title={props.title || ""}
        hiddenTags={props.hiddenTags}
        limit={props.limit}
        showViewMore={props.hasMore}
        hidePostTitles={props.hidePostTitles}
        posts={posts}
        initialData={props.initialData}
      />
    );
  } else if (props.type === "list") {
    return (
      <AppPostListAsync
        title={props.title}
        hiddenTags={props.hiddenTags}
        limit={props.limit}
        posts={posts}
        initialData={props.initialData}
      />
    );
  }
  console.warn(`PostGroup: unexpected displayType "${String(props.type)}"`);
  return null;
}
