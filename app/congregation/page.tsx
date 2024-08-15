import AppPage from '@/components/app-page'
import { getPostsByHiddenTags } from '@/utils/posts'
import AppPostGrid from '@/components/app-post-grid'
import { attributes } from '@/content/pages/congregation.md'

export default function History() {
  const { subCategories } = attributes as PageCongregation

  const subCategoriesData = subCategories.map(({ title, hiddenTags }) => ({
    title,
    posts: getPostsByHiddenTags(hiddenTags).slice(0, 4)
  }))

  return (
    <AppPage>
      <ul className='space-y-12'>
        {subCategoriesData.map(({ title, posts }, index) => (
          <li key={index}>
            <h2 className='uppercase mb-2 text-2xl'>{title}</h2>
            <AppPostGrid posts={posts} />
          </li>
        ))}
      </ul>
    </AppPage>
  )
}