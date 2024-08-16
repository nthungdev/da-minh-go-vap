import { attributes } from '@/content/pages/missions/education.md'
import AppCategoriesPage from '@/components/app-categories-page'

export default function PageMissionsEducation() {
  const { title, categories } = attributes as PageMissionsEducation

  return (
    <AppCategoriesPage categories={categories} title={title} />
  )
}