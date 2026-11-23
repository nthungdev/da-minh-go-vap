import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import type { Locale } from "@/i18n/config";
import { applyRouteLocale, type LocaleParams } from "@/i18n/server";
import { makeContributorPostsPath } from "@/utils/post";
import { getContributorDisplayName } from "@/utils/post-contributors";
import { getContributorById } from "@/utils/post-server";
import {
  type PostsPageParams,
  type PostsPageSearchParams,
  parsePostsPageParams,
  resolvePostsPageTitle,
} from "@/utils/posts-page-params";
import { getServerOrigin } from "@/utils/url";

type Props = {
  params: Promise<LocaleParams>;
  searchParams: Promise<PostsPageSearchParams>;
};

/**
 * Resolves the `c` contributor's display name; 404s on a malformed or unknown id.
 */
async function resolveContributorName(
  params: PostsPageParams,
  locale: Locale,
): Promise<string | undefined> {
  if (params.invalid) notFound();
  if (!params.contributorId) return undefined;

  const contributor = await getContributorById(params.contributorId, {
    locale,
  });
  if (!contributor) notFound();
  return getContributorDisplayName(contributor) || undefined;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const locale = applyRouteLocale((await props.params).locale);
  const [searchParams, t, origin] = await Promise.all([
    props.searchParams,
    getTranslations({ locale, namespace: "posts" }),
    getServerOrigin(),
  ]);

  const params = parsePostsPageParams(searchParams);
  const contributorName = await resolveContributorName(params, locale);
  // Without `c`, keep the layout's site-wide metadata as before
  if (!params.contributorId) return {};

  return {
    title: contributorName,
    description: contributorName
      ? t("byContributor", { name: contributorName })
      : undefined,
    // One canonical URL across page, `ti` and `ht` variants
    alternates: {
      canonical: `${origin}${makeContributorPostsPath(params.contributorId)}`,
    },
  };
}

// Dynamic: the hidden-tag, contributor and title filters come from the query string.
export default async function AppPostsPage(props: Props) {
  const locale = applyRouteLocale((await props.params).locale);
  const [searchParams, t] = await Promise.all([
    props.searchParams,
    getTranslations({ locale, namespace: "posts" }),
  ]);

  const params = parsePostsPageParams(searchParams);
  const contributorName = await resolveContributorName(params, locale);
  const title = resolvePostsPageTitle(params, contributorName, t("title"));

  return (
    <AppPage className="space-y-8">
      <AppGridHeader text={title} />
      {params.contributorId ? (
        <AppPostGridPaginated contributorId={params.contributorId} />
      ) : (
        <AppPostGridPaginated hiddenTags={params.hiddenTags} />
      )}
    </AppPage>
  );
}
