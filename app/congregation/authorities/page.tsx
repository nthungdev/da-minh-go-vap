import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/authorities.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationAuthorities() {
  const { categories } = attributes
  const posts = getPostsByHiddenTags(categories)

  return (
    <AppPage>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
