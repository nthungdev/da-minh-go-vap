import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import { attributes } from '@/content/pages/missions/index.md'
import { getPostsByHiddenTags } from '@/utils/posts'

export default function PageMissions() {
  const { title, sections } = attributes as PageMissions

  const sectionData = sections.map(section => {
    if (section.type === 'postSection') {
      return {
        ...section,
        posts: getPostsByHiddenTags(section.hiddenTags,
          { limit: section.limit || undefined }
        ),
      }
    } else {
      return {
        ...section,
        categories: section.categories.map(category => ({
          ...category,
          posts: getPostsByHiddenTags(category.hiddenTags,
            { limit: section.limit || undefined }
          ),
        })),
      }
    }
  })

  return (
    <AppPage>
      <h1 className='sr-only'>{title}</h1>

      <div className='space-y-12'>
        {sectionData.map((section, index) =>
        (
          <div key={index} className='space-y-4'>
            <h1 className="uppercase text-2xl bg-primary-800 p-2.5 text-center text-gray-50 rounded-lg">{section.title}</h1>
            {
              section.type === 'postSection' ? (
                <AppPostGrid posts={section.posts!} />
              ) : (
                <AppPostTabGrid id={`grid-${index}`} subCategories={section.categories!} />
              )
            }
          </div>
        ))}
      </div>
    </AppPage>
  )
}