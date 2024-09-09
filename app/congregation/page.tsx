import AppPage from '@/components/app-page'
import { attributes } from '@/content/pages/congregation.md'
import AppCategoriesPage from '@/components/app-categories-page'

export default function History() {
  const { subCategories, title } = attributes as PageCongregation

  return (
    <AppPage>
      <AppCategoriesPage categories={subCategories} title={title} />
    </AppPage>
  )
}
