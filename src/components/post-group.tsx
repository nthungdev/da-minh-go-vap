import type { ComponentProps } from "react";
import AppGridHeader from "@/components/app-grid-header";
import AppPostGridAsync from "@/components/app-post-grid-async";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import AppPostListAsync from "@/components/app-post-list-async";
import type { AppPost } from "@/definitions";
import { cn } from "@/utils/common";
import {
  type PaginatedPostsData,
  resolvePostGroupRenderConfig,
} from "@/utils/post-pagination";

interface PostGroupProps extends ComponentProps<"div"> {
  hiddenTags: string[];
  limit: number;
  type: "grid" | "list";
  title?: string;
  posts?: AppPost[];
  initialPosts?: AppPost[];
  initialData?: PaginatedPostsData;
  hasMore?: boolean;
  enablePagination?: boolean;
  hidePostTitles?: boolean;
}

export default function PostGroup(props: PostGroupProps) {
  const posts = props.initialPosts ?? props.posts;
  const { mode, pageSize, showViewMore } = resolvePostGroupRenderConfig({
    type: props.type,
    limit: props.limit,
    enablePagination: props.enablePagination,
    hasMore: props.hasMore,
  });

  if (mode === "paginated-grid") {
    return (
      <div className={cn("flex flex-col gap-stack", props.className)}>
        <AppGridHeader text={props.title || ""} />
        <AppPostGridPaginated
          hiddenTags={props.hiddenTags}
          pageSize={pageSize}
          hidePostTitles={props.hidePostTitles}
          posts={posts}
          initialData={props.initialData}
        />
      </div>
    );
  }

  if (mode === "grid") {
    return (
      <AppPostGridAsync
        title={props.title || ""}
        hiddenTags={props.hiddenTags}
        limit={pageSize}
        showViewMore={showViewMore}
        hidePostTitles={props.hidePostTitles}
        posts={posts}
        initialData={props.initialData}
      />
    );
  }

  if (mode === "list") {
    return (
      <AppPostListAsync
        title={props.title}
        hiddenTags={props.hiddenTags}
        limit={pageSize}
        posts={posts}
        initialData={props.initialData}
      />
    );
  }

  console.warn(`PostGroup: unexpected displayType "${String(props.type)}"`);
  return null;
}
