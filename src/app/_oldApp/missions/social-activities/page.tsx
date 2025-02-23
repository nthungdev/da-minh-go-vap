import { attributes } from '@/content/pages/missions/social-activities.md'
import AppGroupedPostsPage from '@/components/app-grouped-posts-page'

export default function PageMissionsSocialActivities() {
  const { title, postGroups } = attributes as PageMissionsSocialActivities

  return (
    <AppGroupedPostsPage categories={postGroups} title={title} />
  )
}