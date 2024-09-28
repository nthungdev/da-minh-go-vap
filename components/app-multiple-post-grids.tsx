import { fetchPostsByHiddenTags } from '@/actions/post'
import AppPostGrid from './app-post-grid'
import AppSeparator from './app-separator'

interface AppMultiplePostGridsProps {
  postGroups: {
    title: string
    hiddenTags: string[]
    limit: number
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
        limit: group.limit,
      }),
    })
  }

  return (
    <ul className="space-y-4">
      {postGroupsData.map(({ title, posts }, index) => (
        <li key={index} className="space-y-4">
          <h2 className="text-2xl uppercase text-center">{title}</h2>
          <AppPostGrid posts={posts} />
          {index !== postGroupsData.length - 1 && <AppSeparator />}
        </li>
      ))}
    </ul>
  )
}
