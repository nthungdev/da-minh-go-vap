import { fetchPostsByHiddenTags } from '@/actions/post'
import AppGridHeader from '@/components/app-grid-header'
import AppPostGridSix from '@/components/app-post-grid-five'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import AppViewMoreLink from '@/components/app-view-more-link'

const POST_COUNT = 6

interface AppTabbedPostGroupProps {
  title: string
  groups: {
    title: string
    hiddenTags: string[]
  }[]
  viewMoreButton?: {
    enable: boolean
    relativeUrl: string
  }
}

async function AppTabbedPostGroup(props: AppTabbedPostGroupProps) {
  const postGroups = []
  for (const group of props.groups) {
    const { posts } = await fetchPostsByHiddenTags(group.hiddenTags, {
      limit: POST_COUNT,
    })
    postGroups.push({
      title: group.title,
      posts,
    })
  }

  return (
    <div className="space-y-4">
      {props.title && <AppGridHeader text={props.title} />}
      <AppPostTabGrid
        id={`home-posts-group-${props.title.replace(/\s/g, '-')}`}
        postGroups={postGroups}
        allPostsLimit={POST_COUNT}
        component={AppPostGridSix}
      />
      {props.viewMoreButton?.enable && (
        <div className="flex flex-row justify-end">
          <AppViewMoreLink href={props.viewMoreButton.relativeUrl} />
        </div>
      )}
    </div>
  )
}

export default AppTabbedPostGroup
