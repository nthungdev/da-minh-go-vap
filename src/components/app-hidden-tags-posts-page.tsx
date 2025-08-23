import AppPostsPage from "./app-posts-page";

interface AppHiddenTagsPostsPageProps {
  title: string;
  hiddenTags: string[];
}

export default async function AppHiddenTagsPostsPage({
  hiddenTags,
  title,
}: AppHiddenTagsPostsPageProps) {
  return <AppPostsPage title={title} hiddenTags={hiddenTags} />;
}
