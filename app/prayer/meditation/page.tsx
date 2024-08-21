import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/prayer/meditation.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PagePrayerMeditation() {
  const { title, hiddenTags } = attributes as PagePrayerMeditation
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
