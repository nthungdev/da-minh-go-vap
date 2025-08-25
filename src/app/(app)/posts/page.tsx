import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";

interface SearchParams {
  /** hidden tags */
  ht?: string;
  /** title */
  ti?: string;
}

export default async function AppPostsPage(props: {
  searchParams: Promise<SearchParams>;
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
