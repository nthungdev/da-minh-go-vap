import AppPage from "@/components/app-page";
import AppMarkdown from "@/components/app-markdown";
import { fetchPostBySlug, fetchPostsByHiddenTags } from "@/actions/post";
import { notFound } from "next/navigation";
import VideoIframe from "@/components/app-video-iframe";
import AppPostGridPaginated from "@/components/app-post-grid-async-paginated";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

const relatedPostsLimit = 12;

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
    limit: relatedPostsLimit,
    skipSlug: post.slug,
  });

  const publishedAt = dayjs(post.publishedAt).format("D MMMM YYYY");

  return (
    <AppPage>
      {video && (
        <VideoIframe
          className="mb-4"
          type={video.type}
          videoId={video.videoId}
        />
      )}

      <h2 className="text-3xl font-semibold">{post.title}</h2>
      <p className="text-sm text-gray-500">{publishedAt}</p>

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
