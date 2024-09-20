import { normalizeText } from 'normalize-text'
import { redirect } from 'next/navigation'
import { attributes } from '@/content/pages/materials/index.md'
import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'

export default async function Page({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug)
  const { sections } = attributes as PageTopics

  const sectionsData = sections.map((section) => ({
    ...section,
    slug: normalizeText(section.title).replaceAll(/\s/g, '-'),
  }))

  const data = sectionsData.find((section) => section.slug === decodedSlug)

  if (!data) {
    redirect('/404')
  }

  const { title, hiddenTags } = data

  return (
    <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
  )
}
