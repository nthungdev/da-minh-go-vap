import { getTranslations } from "next-intl/server";
import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import { applyRouteLocale, type LocaleParams } from "@/i18n/server";

interface SearchParams {
  /** hidden tags */
  ht?: string;
  /** title */
  ti?: string;
}

// Dynamic: the hidden-tag filter and title come from the query string.
export default async function AppPostsPage(props: {
  params: Promise<LocaleParams>;
  searchParams: Promise<SearchParams>;
}) {
  const locale = applyRouteLocale((await props.params).locale);
  const [searchParams, t] = await Promise.all([
    props.searchParams,
    getTranslations({ locale, namespace: "posts" }),
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
