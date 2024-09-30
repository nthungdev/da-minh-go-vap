import { normalizeText } from 'normalize-text'
import { redirect } from 'next/navigation'
import { attributes } from '@/content/pages/vocation/introduction.md'
import AppHiddenTagsPostsPage from '@/components/app-hidden-tags-posts-page'

export default function Page({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug)
  const { timeline } = attributes as PageVocationIntroduction

  const sectionsData = timeline.sections.map((section) => ({
    ...section,
    slug: normalizeText(section.title).replaceAll(/\s/g, '-'),
  }))

  const data = sectionsData.find((category) => category.slug === decodedSlug)

  if (!data) {
    redirect('/404')
  }

  const { title, hiddenTags } = data

  return <AppHiddenTagsPostsPage title={title} hiddenTags={hiddenTags} />
}
