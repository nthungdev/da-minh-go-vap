import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/news/dominican-family.md'

export default function PageNewsDominicanFamily() {
  const { title, hiddenTags } = attributes as PageNewsDominicanFamily

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
