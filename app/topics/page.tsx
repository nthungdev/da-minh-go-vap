import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/topics/index.md'

export default function PageTopics() {
  const { title, sections } = attributes as PageTopics

  return (
    <AppGroupedPostsPage categories={sections} title={title} />
  )
}