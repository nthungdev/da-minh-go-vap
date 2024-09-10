import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/news/index.md'

export default function PageNews() {
  const { title, sections } = attributes as PageNews

  return (
    <AppGroupedPostsPage categories={sections} title={title} />
  )
}