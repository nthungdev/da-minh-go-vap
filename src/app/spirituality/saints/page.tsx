import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/spirituality/saints.md'

export default function SpiritualitySaints() {
  const { title, hiddenTags } = attributes as PageSpiritualitySaints

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
