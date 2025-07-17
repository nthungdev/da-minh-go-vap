import AppMultiplePostGrids from "./app-multiple-post-grids";
import AppPage from "./app-page";

interface AppGroupedPostsPageProps {
  title: string;
  categories: {
    title: string;
    limit?: number;
    hiddenTags: string[];
  }[];
}

export default async function AppGroupedPostsPage({
  title,
  categories,
}: AppGroupedPostsPageProps) {
  return (
    <AppPage>
      <h1 className="sr-only">{title}</h1>
      <AppMultiplePostGrids postGroups={categories} />
    </AppPage>
  );
}
