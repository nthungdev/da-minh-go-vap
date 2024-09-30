import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/news/congregation/obituary.md'

export default function PageNewsCongregation() {
  const { title, postGroups } = attributes as PageNewsCongregationObituary

  return <AppGroupedPostsPage categories={postGroups} title={title} />
}
