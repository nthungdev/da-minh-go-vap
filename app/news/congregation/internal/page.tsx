import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/news/congregation/internal.md'

export default function PageNewsCongregation() {
  const { title, postGroups } = attributes as PageNewsCongregationInternal

  return <AppGroupedPostsPage categories={postGroups} title={title} />
}
