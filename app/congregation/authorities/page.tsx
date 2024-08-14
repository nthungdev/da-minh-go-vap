import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/authorities.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationAuthorities() {
  const { hiddenTags } = attributes
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPage>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
