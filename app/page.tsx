import { fetchAllPosts, fetchPostsByHiddenTags } from '@/actions/post'
import AppAsideSection from '@/components/app-aside-section'
import AppPage from '@/components/app-page'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import AppSeparator from '@/components/app-separator'
import TheBibleVerse from '@/components/the-bible-verse'
import TheLatestPosts from '@/components/the-latest-posts'
import { attributes } from '@/content/pages/home/index.md'

export default async function Home() {
  const { bibleVerses, latestPosts: latestPostsSection, newsByCategories } = attributes as PageHome

  const latestPosts: PostParams[] = latestPostsSection.enable
    ? await fetchAllPosts({ limit: latestPostsSection.limit })
    : []

  const postsByCategoriesData = []
  for (const category of newsByCategories.categories) {
    const subCategories = []
    for (const subCategory of category.subCategories) {
      const posts = await fetchPostsByHiddenTags(subCategory.hiddenTags, {
        limit: newsByCategories.limit,
      })
      subCategories.push({ title: subCategory.title, posts })
    }
    postsByCategoriesData.push({ title: category.title, subCategories })
  }

  return (
    <div>
      <div className="space-y-8">
        <section className="max-w-screen-xl mx-auto px-4">
          <h2 className="sr-only">Câu lời chúa</h2>
          <TheBibleVerse verses={bibleVerses.verses} />
        </section>
      </div>

      <AppPage className="md:flex md:flex-row md:gap-x-8 max-w-screen-xl">
        <div className="space-y-8 flex-1">
          {latestPostsSection.enable && (
            <section>
              <h2 className="sr-only">Tin mới</h2>
              <TheLatestPosts posts={latestPosts} />
            </section>
          )}

          {newsByCategories.enable && (
            <section>
              <h2 className="sr-only">Tin tức theo danh mục</h2>
              <div className="space-y-4">
                {postsByCategoriesData.map((newsCategory, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-2xl text-center uppercase">
                      {newsCategory.title}
                    </h3>
                    <AppPostTabGrid
                      id={`home-posts-group-${index + 1}`}
                      subCategories={newsCategory.subCategories}
                      allPostsLimit={newsByCategories.limit}
                    />
                    {index !== postsByCategoriesData.length - 1 && (
                      <AppSeparator />
                    )}
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
