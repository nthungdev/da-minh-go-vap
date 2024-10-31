import { fetchPostsByHiddenTags } from '@/actions/post'
import AppPostGrid from './app-post-grid'
import AppGridHeader from './app-grid-header'

const DEFAULT_LIMIT = 4

interface AppMultiplePostGridsProps {
  postGroups: {
    title: string
    hiddenTags: string[]
    limit?: number
  }[]
}

export default async function AppMultiplePostGrids(
  props: AppMultiplePostGridsProps
) {
  const { postGroups } = props

  const postGroupsData = []
  for (const group of postGroups) {
    postGroupsData.push({
      title: group.title,
      posts: await fetchPostsByHiddenTags(group.hiddenTags, {
        limit: group.limit || DEFAULT_LIMIT,
      }),
    })
  }

  return (
    <ul className="space-y-8">
      {postGroupsData.map(({ title, posts }, index) => (
        <li key={index} className="space-y-8">
          <AppGridHeader text={title} />
          <AppPostGrid posts={posts} />
        </li>
      ))}
    </ul>
  )
}
