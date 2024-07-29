import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import TheBanner from '@/components/the-banner'
import { attributes } from '@/content/pages/home.md'
import { getAllPosts, getPostsByHiddenTags } from '@/utils/posts'

export default function Home() {
  const { banners, bibleVerses, latestNews, newsByCategories } =
    attributes as Home

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
        <TheBanner banners={banners} />

        <section className="max-w-screen-xl mx-auto px-4">
          <h2 className="sr-only">Câu lời chúa</h2>
          <ul className="space-y-2">
            {bibleVerses.map((verse, index) => (
              <li key={index}>
                <blockquote>
                  <p>{verse.verse}</p>
                  <cite className="block w-full text-right">
                    {verse.reference}
                  </cite>
                </blockquote>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AppPage className="space-y-8">
        {latestNews.enable && (
          <section>
            <h2 className="text-2xl mb-2">Tin mới</h2>
            <AppPostGrid posts={latestPosts} />
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
