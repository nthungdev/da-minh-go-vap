import AppPage from '@/components/app-page';
import AppMarkdown from '@/components/app-markdown';
import { getAllPostSlugs, getPostBySlug } from '@/utils/posts';

export async function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }))
}

export default function Page({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  const video = post.videos?.[0];

  return <AppPage>
    {video && (
      <iframe className='mb-4 w-full aspect-video' src={video.youtubeUrl} allowFullScreen />
    )}

    <h2 className='text-3xl font-semibold'>{post.title}</h2>
    <p className='text-gray-500'>{post.date.toLocaleString('vi')}</p>

    <AppMarkdown className='mt-8'>{post.body}</AppMarkdown>
  </AppPage>
}