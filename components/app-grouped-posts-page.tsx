import AppMultiplePostGrids from './app-multiple-post-grids'
import AppPage from './app-page'

interface AppGroupedPostsPageProps {
  title: string
  categories: {
    title: string
    hiddenTags: string[]
  }[]
  limit?: number
}

export default async function AppGroupedPostsPage({
  title,
  categories,
  limit = 4,
}: AppGroupedPostsPageProps) {
  return (
    <AppPage>
      <h1 className="sr-only">{title}</h1>
      <AppMultiplePostGrids limit={limit} postGroups={categories} />
    </AppPage>
  )
}
