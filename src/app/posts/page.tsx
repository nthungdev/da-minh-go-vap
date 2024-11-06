import AppGridHeader from '@/components/app-grid-header'
import AppPage from '@/components/app-page'
import AppPostGridPaginated from '@/components/app-post-grid-async-paginated'

export default function AppPostsPage({
  searchParams: { ht, ti },
}: {
  searchParams: { ht?: string, ti?: string }
}) {
  const hiddenTags = ht ? decodeURIComponent(ht).split(',') : []
  const title = ti ? decodeURIComponent(ti) : 'Bài viết'

  return (
    <AppPage className='space-y-8'>
      <AppGridHeader text={title} />
      <AppPostGridPaginated hiddenTags={hiddenTags} />
    </AppPage>
  )
}
