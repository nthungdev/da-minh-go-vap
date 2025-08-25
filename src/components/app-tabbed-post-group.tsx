import { fetchPostsByHiddenTags } from "@/actions/post";
import AppGridHeader from "@/components/app-grid-header";
import AppPostGridSix from "@/components/app-post-grid-five";
import AppPostTabGrid from "@/components/app-post-tab-grid";
import { Page } from "@/payload-types";

const POST_COUNT = 6;

interface AppTabbedPostGroupProps {
  title?: string;
  groups: {
    title: string;
    hiddenTags: string[];
    limit: number;
    viewMoreButton?: {
      enable: boolean;
      relativeUrl: Page | string | undefined | null;
    };
  }[];
}

async function AppTabbedPostGroup(props: AppTabbedPostGroupProps) {
  const postGroups = [];
  for (const group of props.groups) {
    const { posts } = await fetchPostsByHiddenTags(group.hiddenTags, {
      limit: POST_COUNT,
    });
    postGroups.push({
      title: group.title,
      posts,
      viewMoreButton: group.viewMoreButton,
      limit: group.limit,
    });
  }

  return (
    <div className="space-y-4">
      {props.title && <AppGridHeader text={props.title} />}
      <AppPostTabGrid
        postGroups={postGroups}
        allPostsLimit={POST_COUNT}
        component={AppPostGridSix}
      />
    </div>
  );
}

export default AppTabbedPostGroup;
