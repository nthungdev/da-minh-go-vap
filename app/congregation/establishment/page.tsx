import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/establishment.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationEstablishment() {
  const { hiddenTags } = attributes
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPage>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
