import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/news/congregation/information.md'

export default function PageNewsCongregation() {
  const { title, postGroups } = attributes as PageNewsCongregationInformation

  return <AppGroupedPostsPage categories={postGroups} title={title} />
}
