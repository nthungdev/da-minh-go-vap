import AppCategoriesPage from '@/components/app-categories-page'
import { attributes } from '@/content/pages/news/index.md'

export default function PageNews() {
  const { title, sections } = attributes as PageNews

  return (
    <AppCategoriesPage categories={sections} title={title} />
  )
}