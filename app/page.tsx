import AppPage from '@/components/app-page'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import TheBanner from '@/components/the-banner'
import TheBibleVerse from '@/components/the-bible-verse'
import TheLatestPosts from '@/components/the-latest-posts'
import { attributes } from '@/content/pages/home.md'
import { getAllPosts, getPostsByHiddenTags } from '@/utils/posts'
import Image from 'next/image'

export default function Home() {
  const {
    banners,
    decorativeGraphic,
    bibleVerses,
    latestNews,
    newsByCategories,
  } = attributes as Home

  let latestPosts: PostParams[] = latestNews.enable
    ? getAllPosts({ limit: latestNews.limit })
    : []

  const newsByCategoriesData = newsByCategories.categories.map(
    ({ title, subCategories }) => ({
      title,
      subCategories: subCategories.map(({ title, hiddenTags }) => ({
        title,
        posts: getPostsByHiddenTags(hiddenTags, {
          limit: newsByCategories.limit,
        }),
      })),
    })
  )

  return (
    <div>
      <div className="space-y-8">
        <div>
          <TheBanner banners={banners} />

          {decorativeGraphic && (
            <div>
              <Image
                src={decorativeGraphic.url}
                alt={decorativeGraphic.alt}
                className="w-full"
                width={1080}
                height={720}
                quality={100}
                sizes="100%"
                priority
              />
            </div>
          )}
        </div>

        <section className="max-w-screen-xl mx-auto px-4">
          <h2 className="sr-only">Câu lời chúa</h2>
          <TheBibleVerse verses={bibleVerses.verses} />
        </section>
      </div>

      <AppPage className="space-y-8">
        {latestNews.enable && (
          <section className='space-y-4'>
            <h2 className="text-2xl mb-2 sr-only">Tin mới</h2>
            <TheLatestPosts posts={latestPosts} />
          </section>
        )}

        {newsByCategories.enable && (
          <section className="space-y-4">
            <h2 className="sr-only">Tin tức theo danh mục</h2>

            {newsByCategoriesData.map((newsCategory, index) => (
              <div key={index}>
                <h3 className="text-2xl mb-2">{newsCategory.title}</h3>
                <AppPostTabGrid category={newsCategory} />
              </div>
            ))}
          </section>
        )}
      </AppPage>
    </div>
  )
}
