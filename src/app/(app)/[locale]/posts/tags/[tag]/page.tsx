import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchPostsByPublicTag } from "@/actions/post";
import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import { applyRouteLocale, type LocaleParams } from "@/i18n/server";

const pageSize = 12;

type Props = {
  params: Promise<LocaleParams & { tag: string }>;
};

export const revalidate = 60;

// Tag pages render on first request, then come from the ISR cache.
export function generateStaticParams(): Awaited<Props["params"]>[] {
  return [];
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const locale = applyRouteLocale(params.locale);
  const t = await getTranslations({ locale });
  const decodedTag = decodeURIComponent(params.tag);
  const data = await fetchPostsByPublicTag(decodedTag, {
    locale,
    limit: 1,
  });

  if (!data) {
    return {
      title: t("notFound.title"),
    };
  }

  return {
    title: data.tag.label,
    description: t("posts.allPosts"),
  };
}

export default async function PublicTagPage(props: Props) {
  const params = await props.params;
  const locale = applyRouteLocale(params.locale);
  const decodedTag = decodeURIComponent(params.tag);
  const data = await fetchPostsByPublicTag(decodedTag, {
    locale,
    limit: pageSize,
  });

  if (!data) {
    notFound();
  }

  return (
    <AppPage className="space-y-8">
      <AppGridHeader text={data.tag.label} />
      <AppPostGridPaginated publicTag={decodedTag} posts={data.posts} />
    </AppPage>
  );
}
