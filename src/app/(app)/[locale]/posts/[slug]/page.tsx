import type { Metadata } from "next";
import Link from "next/link";
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
import { getPublicHiddenTags, makeContributorPostsPath } from "@/utils/post";
import {
  type ContributorCredit,
  type ContributorRoleGroup,
  formatContributorListParts,
  getContributorCredits,
  getContributorNames,
  groupPostContributors,
} from "@/utils/post-contributors";
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
  const authorNames = getContributorNames(
    groupPostContributors(post?.contributors),
    "author",
  );

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

function toPersons(people: ContributorCredit[], origin: string) {
  if (people.length === 0) return undefined;
  return people.map(({ id, name }) => ({
    "@type": "Person",
    name,
    url: id ? `${origin}${makeContributorPostsPath(id)}` : undefined,
  }));
}

/** Builds a minimal schema.org Article JSON-LD crediting the post's contributors by role. */
function buildArticleJsonLd(
  post: NonNullable<Awaited<ReturnType<typeof fetchPostBySlug>>>,
  url: string,
  origin: string,
  groups: ContributorRoleGroup[],
) {
  const thumbnail = getDataOrUndefined(post.thumbnail);
  // schema.org only has `author` and `translator`; other roles become `contributor`
  const otherPeople = groups
    .filter((group) => group.role !== "author" && group.role !== "translator")
    .flatMap((group) => group.people);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    url,
    datePublished: post.publishedAt.toISOString(),
    image: thumbnail?.url ? [transformUrl(thumbnail.url)] : undefined,
    author: toPersons(getContributorCredits(groups, "author"), origin),
    translator: toPersons(getContributorCredits(groups, "translator"), origin),
    contributor: toPersons(otherPeople, origin),
  };
}

/** Renders people as a locale-joined list where each name links to their posts. */
function renderContributorLinks(people: ContributorCredit[], locale: string) {
  return formatContributorListParts(people, locale).map((part, index) => {
    if (part.type === "literal") return part.value;
    const { id, name } = part.person;
    if (!id) return name;
    return (
      <Link
        // biome-ignore lint/suspicious/noArrayIndexKey: one person may appear twice in a role
        key={`${id}-${index}`}
        href={makeContributorPostsPath(id)}
        className="rounded-sm font-medium text-primary-700 transition-colors hover:text-primary-900 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none motion-reduce:transition-none"
      >
        {name}
      </Link>
    );
  });
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
        <PostTemplateRenderer
          block={post.template[0]}
          isTitleHidden={Boolean(post.hideTitle)}
        />
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
  const contributorGroups = groupPostContributors(post.contributors);

  return (
    <AppPage>
      <RefreshRouteOnSave />
      {contributorGroups.length > 0 && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined; `<` is escaped
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              buildArticleJsonLd(post, postHref, origin, contributorGroups),
            ),
          }}
        />
      )}
      <PostViewTracker slug={post.slug} title={post.title} />

      {!post.hideTitle && (
        <h1 className="text-2xl leading-tight font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          {post.title}
        </h1>
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

      {contributorGroups.length > 0 && (
        <div className="mt-6 space-y-1 text-gray-700">
          {contributorGroups.map(({ role, people }) => (
            <p key={role}>
              {t(
                `contributorRoles.${role}.${people.length > 1 ? "other" : "one"}`,
              )}
              : {renderContributorLinks(people, locale)}
            </p>
          ))}
        </div>
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
