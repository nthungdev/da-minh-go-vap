import AppAsideSection from '@/components/app-aside-section'
import AppBanners from '@/components/app-banners'
import AppPage from '@/components/app-page'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import AppSectionHeader from '@/components/app-section-header'
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
  } = attributes as PageHome

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
          <AppBanners banners={banners} />

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

      <AppPage className="md:flex md:flex-row md:gap-x-8 max-w-screen-xl">
        <div className="space-y-8 flex-1">
          {latestNews.enable && (
            <section>
              <h2 className="sr-only">Tin mới</h2>
              <TheLatestPosts posts={latestPosts} />
            </section>
          )}

          {newsByCategories.enable && (
            <section>
              <h2 className="sr-only">Tin tức theo danh mục</h2>
              <div className="space-y-4">
                {newsByCategoriesData.map((newsCategory, index) => (
                  <div key={index} className="space-y-2">
                    <AppSectionHeader>
                      <h3 className="text-2xl">{newsCategory.title}</h3>
                    </AppSectionHeader>
                    <AppPostTabGrid
                      id={`home-posts-group-${index + 1}`}
                      subCategories={newsCategory.subCategories}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="hidden md:block w-64">
          <AppAsideSection />
        </div>
      </AppPage>
    </div>
  )
}
