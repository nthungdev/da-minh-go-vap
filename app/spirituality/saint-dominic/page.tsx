import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import TheDominicQuote from '@/components/the-dominic-quote'
import { attributes } from '@/content/pages/spirituality/saint-dominic.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function SpiritualitySaintDominic() {
  const { title, quotes, hiddenTags } = attributes as PageSpiritualitySaintDominic
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPage className='space-y-12'>
      <h1 className='sr-only'>{title}</h1>

      <section className="space-y-2">
        <h2 className='text-primary-800 font-semibold uppercase text-xl text-center pb-2 border-b-4 border-primary max-w-md mx-auto'>{quotes.title}</h2>
        <TheDominicQuote quotes={quotes.quotes} />
      </section>

      {posts.length > 0 && (
        <section>
          <h2 className='sr-only'>Các bài viết</h2>
          <AppPostGrid posts={posts} />
        </section>
      )}
    </AppPage>
  )
}