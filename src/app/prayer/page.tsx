import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/prayer/index.md'

export default function PagePrayer() {
  const { title, sections } = attributes as PagePrayer

  return (
    <AppGroupedPostsPage categories={sections} title={title} />
  )
}