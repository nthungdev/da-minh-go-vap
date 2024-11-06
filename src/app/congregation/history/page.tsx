import { fetchPostsByHiddenTags } from '@/actions/post'
import { AppAccordionDefault } from '@/components/app-accordion'
import AppMarkdown from '@/components/app-markdown'
import AppMultiplePostGrids from '@/components/app-multiple-post-grids'
import AppPage from '@/components/app-page'
import { attributes } from '@/content/pages/congregation/history.md'

export default async function CongregationHistory() {
  const { developmentHistory, communityHistory } =
    attributes as PageCongregationHistory

  const postGroupsData = []
  for (const category of communityHistory.postGroups) {
    const { posts } = await fetchPostsByHiddenTags(category.hiddenTags, {
      limit: category.limit,
    })
    postGroupsData.push({
      title: category.title,
      posts,
    })
  }

  return (
    <AppPage className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl">{developmentHistory.title}</h2>
        <AppMarkdown>{developmentHistory.body}</AppMarkdown>
        <AppAccordionDefault items={developmentHistory.accordion} alwaysOpen />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">{communityHistory.title}</h2>
        <AppMultiplePostGrids postGroups={communityHistory.postGroups} />
      </section>
    </AppPage>
  )
}
