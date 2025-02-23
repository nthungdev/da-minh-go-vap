import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/culture/index.md'

export default function PageCulture() {
  const { title, sections } = attributes as PageCulture

  return (
    <AppGroupedPostsPage categories={sections} title={title} />
  )
}