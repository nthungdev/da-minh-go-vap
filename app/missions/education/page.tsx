import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import { getPostsByHiddenTags } from '@/utils/posts'
import { attributes } from '@/content/pages/missions/education.md'

export default function PageMissionsEducation() {
  const { categories } = attributes as PageSpirituality

  const categoriesData = categories.map(({ title, hiddenTags }) => ({
    title,
    posts: getPostsByHiddenTags(hiddenTags).slice(0, 4)
  }))

  return (
    <AppPage>
      <ul className='space-y-12'>
        {categoriesData.map(({ title, posts }, index) => (
          <li key={index}>
            <h2 className='uppercase mb-2 text-2xl'>{title}</h2>
            <AppPostGrid posts={posts} />
          </li>
        ))}
      </ul>
    </AppPage>
  )
}