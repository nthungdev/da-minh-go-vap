import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/news/congregation.md'

export default function PageNewsCongregation() {
  const { title, postGroups } = attributes as PageNewsCongregation

  return <AppGroupedPostsPage categories={postGroups} title={title} />
}
