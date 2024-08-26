import { getPostsByHiddenTags } from '@/utils/posts'
import { normalizeText } from 'normalize-text'
import AppPostsPage from '@/components/app-posts-page'
import { redirect } from 'next/navigation'
import { attributes } from '@/content/pages/topics/index.md'

export default function Page({ params }: { params: { slug: string } }) {
  const { sections } = attributes as PageTopics

  const sectionsData = sections.map((section) => ({
    ...section,
    slug: normalizeText(section.title).replaceAll(/\s/g, '-'),
  }))

  const data = sectionsData.find((section) => section.slug === params.slug)

  if (!data) {
    redirect('/404')
  }

  const { title, hiddenTags } = data
  const posts = getPostsByHiddenTags(hiddenTags)

  return (
    <AppPostsPage title={title} posts={posts} />
  )
}
