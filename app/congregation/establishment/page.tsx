import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/establishment.md'
import { getPostsByCategories } from '@/utils/posts'

export default function CongregationEstablishment() {
  const { categories } = attributes
  const posts = getPostsByCategories(categories)

  return (
    <AppPage>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
