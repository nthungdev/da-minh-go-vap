import { attributes } from '@/content/pages/missions/social-activities.md'
import AppCategoriesPage from '@/components/app-categories-page'

export default function PageMissionsSocialActivities() {
  const { title, categories } = attributes as PageMissionsSocialActivities

  return (
    <AppCategoriesPage categories={categories} title={title} />
  )
}