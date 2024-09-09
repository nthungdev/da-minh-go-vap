import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'
import { attributes } from '@/content/pages/congregation/establishment.md'

export default async function CongregationEstablishment() {
  const { title, hiddenTags } = attributes as PageCongregationEstablishment

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
