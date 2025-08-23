import { fetchPostsByHiddenTags } from "@/actions/post";
import AppGridHeader from "./app-grid-header";
import AppPostGrid from "./app-post-grid-async";

const DEFAULT_LIMIT = 4;

interface AppMultiplePostGridsProps {
  postGroups: {
    title: string;
    hiddenTags: string[];
    limit?: number;
  }[];
}

export default async function AppMultiplePostGrids(
  props: AppMultiplePostGridsProps,
) {
  const { postGroups } = props;

  const postGroupsData = [];
  for (const group of postGroups) {
    const { posts, hasMore } = await fetchPostsByHiddenTags(group.hiddenTags, {
      limit: group.limit || DEFAULT_LIMIT,
    });
    postGroupsData.push({
      title: group.title,
      hiddenTags: group.hiddenTags,
      limit: group.limit || DEFAULT_LIMIT,
      posts,
      hasMore,
    });
  }

  return (
    <ul className="space-y-8">
      {postGroupsData.map(
        ({ title, hiddenTags, limit, posts, hasMore }, index) => (
          <li key={index} className="space-y-8">
            <AppGridHeader text={title} />
            <AppPostGrid
              hiddenTags={hiddenTags}
              limit={limit || DEFAULT_LIMIT}
              title={title}
              posts={posts}
              hasMore={hasMore}
            />
          </li>
        ),
      )}
    </ul>
  );
}
