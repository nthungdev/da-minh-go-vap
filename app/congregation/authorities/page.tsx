import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { getAllPosts } from '@/utils/posts'

/**
 * History
 */
export default function CongregationAuthorities() {
  const posts = getAllPosts()

  return (
    <AppPage>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
