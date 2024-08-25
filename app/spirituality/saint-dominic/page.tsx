import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import TheBanner from '@/components/the-banner'
import TheDominicQuote from '@/components/the-dominic-quote'
import { attributes } from '@/content/pages/spirituality/saint-dominic.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function SpiritualitySaintDominic() {
  const { title, banners, hiddenTags } = attributes as PageSpiritualitySaintDominic
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <div>
      <TheBanner banners={banners} />

      <AppPage className='space-y-12'>
        <h1 className='sr-only'>{title}</h1>

        {posts.length > 0 && (
          <section>
            <h2 className='sr-only'>Các bài viết</h2>
            <AppPostGrid posts={posts} />
          </section>
        )}
      </AppPage>

    </div>
  )
}