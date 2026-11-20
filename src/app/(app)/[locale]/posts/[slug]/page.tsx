import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  applyRouteLocale,
  requireSiteAuth,
  type LocaleParams,
} from "@/i18n/server";
import RefreshRouteOnSave from "@/components/refresh-route-on-save";
import VideoIframe from "@/components/app-video-iframe";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import AppPage from "@/components/app-page";
import AppMarkdown from "@/components/app-markdown";
import PostTemplateRenderer from "@/components/post-templates";
import BlocksRenderer from "@/components/blocks-renderer";
import { BlockType } from "@/definitions";
import { fetchPostBySlug } from "@/actions/post";
import { getDataOrUndefined } from "@/payload/utils/data";
import ShareToolbar from "@/components/share-toolbar";
import PostTableOfContents from "@/components/post-table-of-contents";
import { formatDate } from "@/utils/date";
import { getPublicHiddenTags } from "@/utils/post";
import { PublicTagList } from "@/components/public-tag-list";
import PostViewTracker from "@/components/post-view-tracker";
import { getServerOrigin } from "@/utils/url";
import { transformUrl } from "@/utils/cloudflare";

const relatedPostsLimit = 12;

type Props = {
  params: Promise<LocaleParams & { slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, origin] = await Promise.all([props.params, getServerOrigin()]);
  const locale = applyRouteLocale(params.locale);
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug, { locale });

  const url = `${origin}/posts/${post?.slug}`;
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
              url: transformUrl(thumbnail.url),
            },
          ]
        : undefined,
    },
  };
}

export const revalidate = 60;

// Posts render on first request and are then served from the ISR cache;
// prerendering every post in both locales would make builds hit the database
// thousands of times.
export function generateStaticParams(): Awaited<Props["params"]>[] {
  return [];
}

export default async function Page(props: Props) {
  const [params, origin] = await Promise.all([props.params, getServerOrigin()]);
  const locale = applyRouteLocale(params.locale);
  const t = await getTranslations({ locale, namespace: "posts" });
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug, { locale });

  if (!post) notFound();

  if (post.requireHttpBasicAuth) {
    requireSiteAuth(params.locale, `/posts/${post.slug}`);
  }

  const video = post.videos?.[0];
  const hiddenTags = post.hiddenTags
    .filter((tag) => typeof tag !== "string")
    .map((tag) => tag.tag);
  const publicTags = getPublicHiddenTags(post.hiddenTags);

  const publishedAt = formatDate(post.publishedAt);

  const postHref = `${origin}/posts/${post.slug}`;

  const articleContent =
    post.contentMode === "template" && post.template?.[0] ? (
      <div data-post-template={post.template[0].blockType}>
        <PostTemplateRenderer block={post.template[0]} />
      </div>
    ) : post.contentMode === "blocks" && post.contentBlocks?.length ? (
      <BlocksRenderer blocks={post.contentBlocks as BlockType[]} />
    ) : (post.contentMode === "markdown" || !post.contentMode) && post.body ? (
      <AppMarkdown>{post.body}</AppMarkdown>
    ) : null;

  return (
    <AppPage>
      <RefreshRouteOnSave />
      <PostViewTracker slug={post.slug} title={post.title} />

      {!post.hideTitle && (
        <h1 className="text-3xl font-semibold">{post.title}</h1>
      )}

      <p className="text-sm text-gray-500">{publishedAt}</p>

      <ShareToolbar className="mt-4" shareUrl={postHref} locale={locale} />

      {video && (
        <div className="mx-auto mt-8 max-w-[800px]">
          <VideoIframe type={video.type} videoId={video.videoId} />
        </div>
      )}

      {articleContent && (
        <PostTableOfContents enabled={Boolean(post.showTableOfContents)}>
          {articleContent}
        </PostTableOfContents>
      )}

      {publicTags.length > 0 && (
        <PublicTagList className="mt-6" tags={publicTags} />
      )}

      <hr className="my-4 md:my-8" />

      <div className="space-y-4">
        <h2 className="text-2xl">{t("related")}</h2>
        <AppPostGridPaginated
          hiddenTags={hiddenTags}
          skipSlug={post.slug}
          pageSize={relatedPostsLimit}
        />
      </div>
    </AppPage>
  );
}
