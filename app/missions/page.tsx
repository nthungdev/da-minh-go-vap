import { fetchPostsByHiddenTags } from '@/actions/post'
import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import AppPostTabGrid from '@/components/app-post-tab-grid'
import AppSeparator from '@/components/app-separator'
import { attributes } from '@/content/pages/missions/index.md'

export default async function PageMissions() {
  const { title, sections } = attributes as PageMissions

  const sectionData = []
  for (const section of sections) {
    if (section.type === 'postSection') {
      sectionData.push({
        ...section,
        posts: await fetchPostsByHiddenTags(section.hiddenTags, {
          limit: section.limit || undefined,
        }),
      })
    } else {
      const categories = []
      for (const category of section.categories) {
        const posts = await fetchPostsByHiddenTags(category.hiddenTags, {
          limit: section.limit || undefined,
        })
        categories.push({
          ...category,
          posts,
        })
      }
      sectionData.push({
        ...section,
        categories,
      })
    }
  }

  return (
    <AppPage>
      <h1 className="sr-only">{title}</h1>

      <div className="space-y-4">
        {sectionData.map((section, index) => (
          <div key={index} className="space-y-4">
            <h1 className="uppercase text-2xl text-center">{section.title}</h1>
            {section.type === 'postSection' ? (
              <AppPostGrid posts={section.posts!} />
            ) : (
              <AppPostTabGrid
                id={`grid-${index}`}
                subCategories={section.categories!}
              />
            )}
            {index !== sectionData.length - 1 && <AppSeparator />}
          </div>
        ))}
      </div>
    </AppPage>
  )
}
