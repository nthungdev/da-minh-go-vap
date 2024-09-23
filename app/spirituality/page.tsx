import AppGroupedPostsPage from '@/components/app-grouped-posts-page'
import { attributes } from '@/content/pages/spirituality/index.md'

export default function Spirituality() {
  const { title, postGroups, limit } = attributes as PageSpirituality

  return (
    <AppGroupedPostsPage categories={postGroups} title={title} limit={limit} />
  )
}
