import { fetchPostsByHiddenTags } from '@/actions/post'
import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation/authorities.md'

export default async function CongregationAuthorities() {
  const { title, hiddenTags } = attributes as PageCongregationAuthorities
  const posts = await fetchPostsByHiddenTags(hiddenTags)

  return (
    <AppPage className='space-y-4'>
      <h2 className='uppercase text-2xl'>{title}</h2>
      <AppPostGrid posts={posts} />
    </AppPage>
  )
}
