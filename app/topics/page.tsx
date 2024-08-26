import AppCategoriesPage from '@/components/app-categories-page'
import { attributes } from '@/content/pages/topics/index.md'

export default function PagePrayer() {
  const { title, sections } = attributes as PageTopics

  return (
    <AppCategoriesPage categories={sections} title={title} />
  )
}