import AppPage from '@/components/app-page';
import AppMarkdown from '@/components/app-markdown';
import { getAllPostSlugs, getPostBySlug, getPostsByHiddenTags } from '@/utils/posts';
import AppPostGrid from '@/components/app-post-grid';

export async function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug, test: 'hello' }))
}

export default function Page({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  const video = post.videos?.[0];

  const relatedPosts = getPostsByHiddenTags(post.hiddenTags, { limit: 12 });

  return <AppPage>
    {video && (
      <iframe className='mb-4 w-full aspect-video' src={video.youtubeUrl} allowFullScreen />
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