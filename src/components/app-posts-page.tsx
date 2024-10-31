import AppPage from "./app-page";
import AppPostGrid from "./app-post-grid";

interface AppPageProps {
  title: string;
  posts: PostParams[];
}

export default function AppPostsPage({
  posts,
  title,
}: AppPageProps) {
  return (
    <AppPage className="space-y-4">
      <h1 className="uppercase text-2xl">{title}</h1>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
