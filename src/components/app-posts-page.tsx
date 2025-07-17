import AppPage from "./app-page";
import AppPostGridPaginated from "./app-post-grid-async-paginated";

interface AppPageProps {
  title: string;
  hiddenTags: string[];
}

export default function AppPostsPage({ hiddenTags, title }: AppPageProps) {
  return (
    <AppPage className="space-y-4">
      <h1 className="uppercase text-2xl">{title}</h1>
      <AppPostGridPaginated hiddenTags={hiddenTags} />
    </AppPage>
  );
}
