import AppCategoriesPage from '@/components/app-categories-page'
import { attributes } from '@/content/pages/prayer/index.md'

export default function PagePrayer() {
  const { title, sections } = attributes as PagePrayer

  return (
    <AppCategoriesPage categories={sections} title={title} />
  )
}