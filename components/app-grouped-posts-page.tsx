import AppPage from './app-page'
import AppPostGrid from './app-post-grid'
import AppSeparator from './app-separator'
import { fetchPostsByHiddenTags } from '@/actions/post'

interface AppGroupedPostsPageProps {
  title: string
  categories: {
    title: string
    hiddenTags: string[]
  }[]
}

export default async function AppGroupedPostsPage({
  title,
  categories,
}: AppGroupedPostsPageProps) {
  const categoriesData = []
  for (const category of categories) {
    const { title, hiddenTags } = category
    categoriesData.push({
      title,
      posts: (await fetchPostsByHiddenTags(hiddenTags)).slice(0, 4),
    })
  }

  return (
    <AppPage>
      <h1 className="sr-only">{title}</h1>
      <ul className="space-y-4">
        {categoriesData.map(({ title, posts }, index) => (
          <li key={index} className="space-y-4">
            <h2 className="text-2xl uppercase text-center">{title}</h2>
            <AppPostGrid posts={posts} />
            {index !== categoriesData.length - 1 && <AppSeparator />}
          </li>
        ))}
      </ul>
    </AppPage>
  )
}
