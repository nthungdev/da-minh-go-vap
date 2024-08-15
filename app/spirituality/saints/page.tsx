import AppPostsPage from '@/components/app-posts-page'
import { attributes } from '@/content/pages/spirituality/saints.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function SpiritualitySaints() {
  const { title, hiddenTags } = attributes as PageSpiritualitySaints
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
