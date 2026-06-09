import { fetchPostsByPublicTag } from "@/actions/post";
import AppGridHeader from "@/components/app-grid-header";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const pageSize = 12;

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [locale, params] = await Promise.all([getLocale(), props.params]);
  const decodedTag = decodeURIComponent(params.tag);
  const data = await fetchPostsByPublicTag(decodedTag, {
    locale,
    limit: 1,
  });

  if (!data) {
    return {
      title: locale === "vi" ? "Không Tìm Thấy" : "Not Found",
    };
  }

  return {
    title: data.tag.label,
    description: locale === "vi" ? `Các bài viết` : "Posts",
  };
}

export default async function PublicTagPage(props: Props) {
  const [locale, params] = await Promise.all([getLocale(), props.params]);
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
