import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/news/vietnam-church.md'

export default function PageNewsVietnamChurch() {
  const { title, hiddenTags } = attributes as PageNewsVietnamChurch

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
