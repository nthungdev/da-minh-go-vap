import AppPage from "@/components/app-page";
import AppMarkdown from "@/components/app-markdown";
import { fetchPostBySlug, fetchPostsByHiddenTags } from "@/actions/post";
import { notFound } from "next/navigation";
import VideoIframe from "@/components/app-video-iframe";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";

// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  const video = post.videos?.[0];
  const hiddenTags = post.hiddenTags
    .filter((t) => typeof t !== "string")
    .map((t) => t.tag);
  const { posts: relatedPosts } = await fetchPostsByHiddenTags(hiddenTags, {
    limit: 12,
    skipSlug: post.slug,
  });

  return (
    <AppPage>
      {video && (
        <VideoIframe className="mb-4" type={video.type} url={video.url} />
      )}

      <h2 className="text-3xl font-semibold">{post.title}</h2>
      <p className="text-gray-500">{post.publishedAt.toLocaleString("vi")}</p>

      <AppMarkdown className="mt-8">{post.body}</AppMarkdown>

      <div className="mt-12 space-y-4">
        <h2 className="text-2xl">Các bài liên quan</h2>
        <AppPostGridPaginated
          hiddenTags={hiddenTags}
          posts={relatedPosts}
          skipSlug={post.slug}
        />
      </div>
    </AppPage>
  );
}
