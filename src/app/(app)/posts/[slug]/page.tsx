import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import RefreshRouteOnSave from "@/components/refresh-route-on-save";
import VideoIframe from "@/components/app-video-iframe";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import AppPage from "@/components/app-page";
import AppMarkdown from "@/components/app-markdown";
import { fetchPostBySlug, fetchPostsByHiddenTags } from "@/actions/post";
import { getDataOrUndefined } from "@/payload/utils/data";
import ShareToolbar from "@/components/share-toolbar";
import { formatDate } from "@/utils/date";
import { basicAuthGuard } from "@/utils/auth";

const relatedPostsLimit = 12;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const locale = await getLocale();
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug, { locale });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${post?.slug}`;
  const thumbnail = getDataOrUndefined(post?.thumbnail);

  return {
    title: post?.seo?.title,
    description: post?.seo?.description,
    keywords: post?.seo?.keywords,
    openGraph: {
      url,
      title: post?.seo?.title || undefined,
      description: post?.seo?.description || undefined,
      type: "article",
      images: thumbnail?.url
        ? [
            {
              url: thumbnail.url,
            },
          ]
        : undefined,
    },
  };
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug, { locale });

  if (!post) notFound();

  if (post.requireHttpBasicAuth) {
    await basicAuthGuard();
  }

  const video = post.videos?.[0];
  const hiddenTags = post.hiddenTags
    .filter((t) => typeof t !== "string")
    .map((t) => t.tag);
  const { posts: relatedPosts } = await fetchPostsByHiddenTags(hiddenTags, {
    limit: relatedPostsLimit,
    skipSlug: post.slug,
  });

  const publishedAt = formatDate(post.publishedAt);

  const postHref = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${post.slug}`;

  return (
    <AppPage>
      <RefreshRouteOnSave />

      {video && (
        <VideoIframe
          className="mb-4"
          type={video.type}
          videoId={video.videoId}
        />
      )}

      {!post.hideTitle && (
        <h1 className="text-3xl font-semibold">{post.title}</h1>
      )}

      <p className="text-sm text-gray-500">{publishedAt}</p>

      <ShareToolbar className="mt-4" shareUrl={postHref} />

      <AppMarkdown className="mt-8">{post.body}</AppMarkdown>

      <div className="mt-12 space-y-4">
        <h2 className="text-2xl">Các bài liên quan</h2>
        <AppPostGridPaginated
          hiddenTags={hiddenTags}
          posts={relatedPosts}
          skipSlug={post.slug}
          pageSize={relatedPostsLimit}
        />
      </div>
    </AppPage>
  );
}
