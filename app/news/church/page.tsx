import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/news/church.md'

export default function PageNewsChurch() {
  const { title, hiddenTags } = attributes as PageNewsChurch

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
