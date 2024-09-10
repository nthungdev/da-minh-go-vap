import AppCategoriesPage from '@/components/app-categories-page'
import { attributes } from '@/content/pages/spirituality/index.md'

export default function Spirituality() {
  const { title, categories } = attributes as PageSpirituality

  return (
    <AppCategoriesPage categories={categories} title={title} />
  )
}