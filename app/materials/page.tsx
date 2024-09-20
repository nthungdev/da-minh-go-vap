import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/materials/index.md'

export default function PageMaterials() {
  const { title, sections } = attributes as PageTopics

  return (
    <AppGroupedPostsPage categories={sections} title={title} />
  )
}