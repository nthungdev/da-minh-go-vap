import { attributes } from '@/content/pages/congregation/index.md'
import AppGroupedPostsPage from '@/components/app-grouped-posts-page'

export default function History() {
  const { subCategories, title } = attributes as PageCongregation

  return <AppGroupedPostsPage categories={subCategories} title={title} />
}
