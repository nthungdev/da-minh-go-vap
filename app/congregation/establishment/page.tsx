import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/establishment.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationEstablishment() {
  const { title, hiddenTags } = attributes as PageCongregationEstablishment
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPage className='space-y-4'>
      <h2 className='uppercase text-2xl'>{title}</h2>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
