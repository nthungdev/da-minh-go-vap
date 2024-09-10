import { attributes } from '@/content/pages/missions/education.md'
import AppGroupedPostsPage from '@/components/app-grouped-posts-page'

export default function PageMissionsEducation() {
  const { title, postGroups } = attributes as PageMissionsEducation

  return (
    <AppGroupedPostsPage categories={postGroups} title={title} />
  )
}