import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import { getTranslations } from "next-intl/server";

interface SearchParams {
  /** hidden tags */
  ht?: string;
  /** title */
  ti?: string;
}

export default async function AppPostsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const [searchParams, t] = await Promise.all([
    props.searchParams,
    getTranslations("posts"),
  ]);

  const { ht, ti } = searchParams;

  const hiddenTags = ht ? decodeURIComponent(ht).split(",") : [];
  const title = ti ? decodeURIComponent(ti) : t("title");

  return (
    <AppPage className="space-y-8">
      <AppGridHeader text={title} />
      <AppPostGridPaginated hiddenTags={hiddenTags} />
    </AppPage>
  );
}
