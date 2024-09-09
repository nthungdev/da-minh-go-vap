import { fetchPostsByHiddenTags } from "@/actions/post";
import AppAccordion, { AppAccordionDefault } from "@/components/app-accordion";
import AppMarkdown from '@/components/app-markdown'
import AppPage from '@/components/app-page'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import { attributes } from '@/content/pages/congregation/history.md'

export default async function CongregationHistory() {
  const { developmentHistory, communityHistory } =
    attributes as PageCongregationHistory

  const categoriesData = []
  for (const category of communityHistory.subCategories) {
    categoriesData.push({
      title: category.title,
      posts: await fetchPostsByHiddenTags(category.hiddenTags),
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
        <AppPostTabGrid subCategories={categoriesData} />
      </section>
    </AppPage>
  )
}
