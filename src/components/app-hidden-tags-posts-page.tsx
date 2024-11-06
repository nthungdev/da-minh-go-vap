import { fetchPostsByHiddenTags } from '@/actions/post'
import AppPostsPage from './app-posts-page'

interface AppHiddenTagsPostsPageProps {
  title: string
  hiddenTags: string[]
}

export default async function AppHiddenTagsPostsPage({
  hiddenTags,
  title,
}: AppHiddenTagsPostsPageProps) {
  const { posts } = await fetchPostsByHiddenTags(hiddenTags)

  return <AppPostsPage title={title} posts={posts} />
}
