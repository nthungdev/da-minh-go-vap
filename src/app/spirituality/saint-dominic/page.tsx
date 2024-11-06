import AppGridHeader from '@/components/app-grid-header'
import AppPage from '@/components/app-page'
import AppPostGridPaginated from '@/components/app-post-grid-async-paginated'
import { attributes } from '@/content/pages/spirituality/saint-dominic.md'

export default async function SpiritualitySaintDominic() {
  const { title, hiddenTags } = attributes as PageSpiritualitySaintDominic

  return (
    <AppPage className='space-y-8'>
      <AppGridHeader text={title} />
      <AppPostGridPaginated hiddenTags={hiddenTags} />
    </AppPage>
  )
}
