import AppAccordion, { AppAccordionDefault } from "@/components/app-accordion";
import AppMarkdown from '@/components/app-markdown'
import AppPage from '@/components/app-page'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import { attributes } from '@/content/pages/congregation/history.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationHistory() {
  const { developmentHistory, communityHistory } =
    attributes as PageCongregationHistory

  const categoriesData = communityHistory.subCategories.map(
    ({ title, hiddenTags }) => ({
      title,
      posts: getPostsByHiddenTags(hiddenTags).slice(0, 4),
    })
  )

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
