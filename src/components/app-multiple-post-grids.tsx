import { fetchPostsByHiddenTags } from '@/actions/post'
import AppGridHeader from './app-grid-header'
import AppPostGrid from './app-post-grid-async'

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

  return (
    <ul className="space-y-8">
      {postGroups.map(({ title, hiddenTags, limit }, index) => (
        <li key={index} className="space-y-8">
          <AppGridHeader text={title} />
          <AppPostGrid hiddenTags={hiddenTags} limit={limit || DEFAULT_LIMIT} title={title} />
        </li>
      ))}
    </ul>
  )
}
