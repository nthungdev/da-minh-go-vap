import { fetchPostsByHiddenTags } from '@/actions/post'
import AppGridHeader from '@/components/app-grid-header'
import AppPage from '@/components/app-page'
import AppPostGrid from '@/components/app-post-grid'
import AppPostTabGrid from '@/components/app-post-tab-grid'
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

      <div className="space-y-8">
        {sectionData.map((section, index) => (
          <div key={index} className="space-y-8">
            <AppGridHeader text={section.title} />
            {section.type === 'postSection' ? (
              <AppPostGrid posts={section.posts!} />
            ) : (
              <AppPostTabGrid
                id={`grid-${index}`}
                postGroups={section.categories!}
                allPostsLimit={section.limit}
              />
            )}
          </div>
        ))}
      </div>
    </AppPage>
  )
}
