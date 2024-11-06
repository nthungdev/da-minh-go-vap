import { fetchAllPosts, fetchPostsByHiddenTags } from '@/actions/post'
import AppAsideSection from '@/components/app-aside-section'
import AppGridHeader from '@/components/app-grid-header'
import AppPage from '@/components/app-page'
import AppPostGridSix from '@/components/app-post-grid-five'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import TheBibleVerse from '@/components/the-bible-verse'
import TheLatestPosts from '@/components/the-latest-posts'
import { attributes } from '@/content/pages/home/index.md'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

const POST_COUNT = 6

export default async function Home() {
  const {
    bibleVerses,
    latestPosts: latestPostsSection,
    newsByCategories,
  } = attributes as PageHome

  const latestPosts: PostParams[] = latestPostsSection.enable
    ? await fetchAllPosts({ limit: latestPostsSection.limit })
    : []

  const postsByCategoriesData = []
  for (const category of newsByCategories.categories) {
    const subCategories = []
    for (const subCategory of category.subCategories) {
      const posts = await fetchPostsByHiddenTags(subCategory.hiddenTags, {
        limit: POST_COUNT,
      })
      subCategories.push({
        title: subCategory.title,
        posts,
      })
    }
    postsByCategoriesData.push({
      title: category.title,
      viewMoreButton: category.viewMoreButton,
      subCategories,
    })
  }

  // console.log(JSON.stringify(postsByCategoriesData, null, 2))

  return (
    <AppPage className="space-y-8">
      <section>
        <h2 className="sr-only">Câu lời chúa</h2>
        <TheBibleVerse className="mx-auto" verses={bibleVerses.verses} />
      </section>

      <div className="flex flex-col md:flex md:flex-row gap-x-4 lg:gap-x-6">
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
              {/* <AppTest newsByCategories={newsByCategories} /> */}
              <div className="space-y-12">
                {postsByCategoriesData.map((newsCategory, index) => (
                  <div key={index} className="space-y-4">
                    <AppGridHeader text={newsCategory.title} />
                    <AppPostTabGrid
                      id={`home-posts-group-${index + 1}`}
                      postGroups={newsCategory.subCategories}
                      allPostsLimit={POST_COUNT}
                      component={AppPostGridSix}
                    />
                    {newsCategory.viewMoreButton?.enable && (
                      <div className="flex flex-row justify-end">
                        <Link
                          href={newsCategory.viewMoreButton.relativeUrl}
                          className="text-secondary flex flex-row justify-end items-center space-x-1 hover:scale-105 transition-transform"
                        >
                          <span>Xem tiếp</span>
                          <FaArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="hidden md:block w-56 lg:w-64">
          <AppAsideSection />
        </div>
      </div>
    </AppPage>
  )
}
