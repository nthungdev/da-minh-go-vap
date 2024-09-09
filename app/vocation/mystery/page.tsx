import { attributes } from '@/content/pages/vocation/mystery.md'
import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'

export default function PageVocationMystery() {
  const { title, hiddenTags } = attributes as PageVocationMystery

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
