import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/news/congregation/profession.md'

export default function PageNewsCongregation() {
  const { title, postGroups } = attributes as PageNewsCongregationProfession

  return <AppGroupedPostsPage categories={postGroups} title={title} />
}
