import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";

export default async function AppPostsPage(props: {
  searchParams: Promise<{ ht?: string; ti?: string }>;
}) {
  const searchParams = await props.searchParams;

  const { ht, ti } = searchParams;

  const hiddenTags = ht ? decodeURIComponent(ht).split(",") : [];
  const title = ti ? decodeURIComponent(ti) : "Bài viết";

  return (
    <AppPage className="space-y-8">
      <AppGridHeader text={title} />
      <AppPostGridPaginated hiddenTags={hiddenTags} />
    </AppPage>
  );
}
