import { attributes } from '@/content/pages/spirituality/charism.md'
import { normalizeText } from 'normalize-text'
import { redirect } from 'next/navigation'
import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'

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

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
