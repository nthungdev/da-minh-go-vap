import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/congregation/gratitude.md'

export default async function CongregationAuthorities() {
  const { title, postGroups } = attributes as PageCongregationGratitude

  return <AppGroupedPostsPage categories={postGroups} title={title} />
}
