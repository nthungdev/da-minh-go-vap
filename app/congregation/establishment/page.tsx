import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/congregation/establishment.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationEstablishment() {
  const { title, hiddenTags } = attributes as PageCongregationEstablishment
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
