import AppPage from '@/components/app-page';
import AppMarkdown from '@/components/app-markdown';
import AppPostGrid from '@/components/app-post-grid';
import { fetchPostBySlug, fetchPostsByHiddenTags } from '@/actions/post';
import { redirect } from 'next/navigation';

// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

// // Next.js will invalidate the cache when a
// // request comes in, at most once every 60 seconds.
// export const revalidate = 60

// // We'll prerender only the params from `generateStaticParams` at build time.
// // If a request comes in for a path that hasn't been generated,
// // Next.js will server-render the page on-demand.
// export const dynamicParams = true // or false, to 404 on unknown paths

// export async function generateStaticParams() {
//   let posts: PostParams[] = await fetchAllPosts()
//   return posts.map((post) => ({
//     slug: post.slug,
//   }))
// }

export default async function Page({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug)
  const post = await fetchPostBySlug(decodedSlug);

  if (!post) {
    redirect('/404')
  }

  const video = post.videos?.[0];
  const relatedPosts = await fetchPostsByHiddenTags(post.hiddenTags, { limit: 12 });

  return <AppPage>
    {video && (
      <iframe className='mb-4 w-full aspect-video' src={video.url} allowFullScreen />
    )}

    <h2 className='text-3xl font-semibold'>{post.title}</h2>
    <p className='text-gray-500'>{post.date.toLocaleString('vi')}</p>

    <AppMarkdown className='mt-8'>{post.body}</AppMarkdown>

    <div className='mt-12'>
      <h2 className='text-2xl'>Các bài liên quan</h2>
      <AppPostGrid classNames='mt-4' posts={relatedPosts} />
    </div>
  </AppPage>
}