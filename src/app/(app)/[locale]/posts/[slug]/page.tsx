import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchPostBySlug } from "@/actions/post";
import AppMarkdown from "@/components/app-markdown";
import AppPage from "@/components/app-page";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import VideoIframe from "@/components/app-video-iframe";
import BlocksRenderer from "@/components/blocks-renderer";
import PostTableOfContents from "@/components/post-table-of-contents";
import PostTemplateRenderer from "@/components/post-templates";
import PostViewTracker from "@/components/post-view-tracker";
import { PublicTagList } from "@/components/public-tag-list";
import RefreshRouteOnSave from "@/components/refresh-route-on-save";
import ShareToolbar from "@/components/share-toolbar";
import type { BlockType } from "@/definitions";
import {
  applyRouteLocale,
  type LocaleParams,
  requireSiteAuth,
} from "@/i18n/server";
import { getDataOrUndefined } from "@/payload/utils/data";
import { transformUrl } from "@/utils/cloudflare";
import { formatDate } from "@/utils/date";
import { getPublicHiddenTags } from "@/utils/post";
import {
  formatPostAuthorNames,
  getPostAuthorNames,
} from "@/utils/post-authors";
import { getServerOrigin } from "@/utils/url";

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
  const authorNames = getPostAuthorNames(post?.authors);

  return {
    title: post?.seo?.title,
    description: post?.seo?.description,
    keywords: post?.seo?.keywords,
    ...(post?.requireHttpBasicAuth
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      url,
      title: post?.seo?.title || undefined,
      description: post?.seo?.description || undefined,
      type: "article",
      authors: authorNames.length > 0 ? authorNames : undefined,
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

/** Builds a minimal schema.org Article JSON-LD carrying the post's authors. */
function buildArticleJsonLd(
  post: NonNullable<Awaited<ReturnType<typeof fetchPostBySlug>>>,
  url: string,
  authorNames: string[],
) {
  const thumbnail = getDataOrUndefined(post.thumbnail);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    url,
    datePublished: post.publishedAt.toISOString(),
    image: thumbnail?.url ? [transformUrl(thumbnail.url)] : undefined,
    author: authorNames.map((name) => ({ "@type": "Person", name })),
  };
}

/** Serializes JSON-LD for an inline script, escaping `<` so content can't close the tag. */
function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function renderArticleContent(
  post: NonNullable<Awaited<ReturnType<typeof fetchPostBySlug>>>,
) {
  if (post.contentMode === "template" && post.template?.[0]) {
    return (
      <div data-post-template={post.template[0].blockType}>
        <PostTemplateRenderer block={post.template[0]} />
      </div>
    );
  }

  if (post.contentMode === "blocks" && post.contentBlocks?.length) {
    return <BlocksRenderer blocks={post.contentBlocks as BlockType[]} />;
  }

  if ((post.contentMode === "markdown" || !post.contentMode) && post.body) {
    return <AppMarkdown>{post.body}</AppMarkdown>;
  }

  return null;
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
  const articleContent = renderArticleContent(post);
  const authorNames = getPostAuthorNames(post.authors);

  return (
    <AppPage>
      <RefreshRouteOnSave />
      {authorNames.length > 0 && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined; `<` is escaped
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              buildArticleJsonLd(post, postHref, authorNames),
            ),
          }}
        />
      )}
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

      {authorNames.length > 0 && (
        <p className="mt-6 text-gray-700">
          {authorNames.length > 1 ? t("authors") : t("author")}:{" "}
          {formatPostAuthorNames(authorNames, locale)}
        </p>
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
