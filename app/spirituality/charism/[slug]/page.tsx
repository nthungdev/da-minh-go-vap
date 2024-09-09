import { getPostsByHiddenTags } from '@/utils/posts'
import { attributes } from '@/content/pages/spirituality/charism.md'
import { normalizeText } from 'normalize-text'
import AppPostsPage from '@/components/app-posts-page'
import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { slug: string } }) {
const decodedSlug = decodeURIComponent(params.slug)
  const { categories } = attributes as PageSpiritualityCharism

  const categoriesData = categories.map((category) => ({
    ...category,
    slug: normalizeText(category.title).replaceAll(/\s/g, '-'),
  }))

  const data = categoriesData.find((category) => category.slug === decodedSlug)

  if (!data) {
    redirect('/404')
  }

  const { title, hiddenTags } = data
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
