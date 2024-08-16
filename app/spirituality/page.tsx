import { attributes } from '@/content/pages/spirituality.md'
import AppCategoriesPage from '@/components/app-categories-page'

export default function Spirituality() {
  const { title, categories } = attributes as PageSpirituality

  return (
    <AppCategoriesPage categories={categories} title={title} />
  )
}