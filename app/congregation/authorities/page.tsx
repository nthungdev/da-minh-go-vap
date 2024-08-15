import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/authorities.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function CongregationAuthorities() {
  const { title, hiddenTags } = attributes as PageCongregationAuthorities
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPage className='space-y-4'>
      <h2 className='uppercase text-2xl'>{title}</h2>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
