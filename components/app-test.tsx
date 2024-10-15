import { fetchPostsByHiddenTags } from '@/actions/post'
import AppGridHeader from './app-grid-header'
import AppPostTabGrid from './app-post-tab-grid'
import AppPostGridFive from './app-post-grid-five'

interface AppTestProps {
  newsByCategories: {
    enable: boolean
    limit: number
    categories: {
      title: string
      subCategories: {
        title: string
        hiddenTags: string[]
      }[]
    }[]
  }
}

export default async function AppTest(props: AppTestProps) {
  const { newsByCategories } = props

  const postsByCategoriesData = []
  for (const category of newsByCategories.categories) {
    const subCategories = []
    for (const subCategory of category.subCategories) {
      const posts = await fetchPostsByHiddenTags(subCategory.hiddenTags, {
        limit: newsByCategories.limit,
      })
      subCategories.push({ title: subCategory.title, posts })
    }
    postsByCategoriesData.push({ title: category.title, subCategories })
  }

  return (
    <div className="space-y-12">
      {postsByCategoriesData.map((newsCategory, index) => (
        <div key={index} className="space-y-4">
          <AppGridHeader text={newsCategory.title} />
          <AppPostTabGrid
            id={`home-posts-group-${index + 1}`}
            postGroups={newsCategory.subCategories}
            allPostsLimit={newsByCategories.limit}
            component={AppPostGridFive}
          />
        </div>
      ))}
    </div>
  )
}
