import AppPostGrid from "@/components/app-post-grid-async";
import AppPostListAsync from "@/components/app-post-list-async";
import { AppPost } from "@/definitions";
import { ComponentProps } from "react";

interface PostGroupProps extends ComponentProps<"div"> {
  hiddenTags: string[];
  limit: number;
  type: "grid" | "list";
  title?: string;
  posts?: AppPost[];
  hasMore?: boolean;
}

export default function PostGroup(props: PostGroupProps) {
  if (props.type === "grid") {
    return (
      <AppPostGrid
        title={props.title || ""}
        hiddenTags={props.hiddenTags}
        limit={props.limit}
        hasMore={props.hasMore}
      />
    );
  } else if (props.type === "list") {
    return (
      <AppPostListAsync
        title={props.title}
        hiddenTags={props.hiddenTags}
        limit={props.limit}
      />
    );
  }
}
