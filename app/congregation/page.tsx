import AppPage from '@/components/app-page'
import { getPostsByHiddenTags } from '@/utils/posts'
import AppPostGrid from '@/components/app-post-grid'

export default function History() {
  const introductionPosts = getPostsByHiddenTags(['Giới thiệu'], { limit: 4 })
  const historyPosts = getPostsByHiddenTags(['Lịch sử'], { limit: 4 })
  const establishmentPosts = getPostsByHiddenTags(['Sắc lập dòng'], { limit: 4 })
  const authoritiesPosts = getPostsByHiddenTags(['Các đấng bản quyền'], { limit: 4 })

  const data = [
    {
      title: 'Giới thiệu',
      posts: introductionPosts
    },
    {
      title: 'Lịch sử',
      posts: historyPosts
    },
    {
      title: 'Sắc lập dòng',
      posts: establishmentPosts
    },
    {
      title: 'Các đấng bản quyền',
      posts: authoritiesPosts,
    }
  ].filter(({ posts }) => posts.length > 0)

  return (
    <AppPage>
      <ul className='space-y-8'>
        {data.map(({ title, posts }, index) => (
          <li key={index}>
            <h2 className='uppercase mb-2 text-2xl'>{title}</h2>
            <AppPostGrid posts={posts} />
          </li>
        ))}
      </ul>
    </AppPage>
  )
}