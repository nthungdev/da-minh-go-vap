import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/news/congregation.md'

export default function PageNewsCongregation() {
  const { title, hiddenTags } = attributes as PageNewsCongregation

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
