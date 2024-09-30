import AppPage from '@/components/app-page'
import AppTimelineCards from '@/components/app-timeline-cards'
import { attributes } from '@/content/pages/spirituality/charism.md'
import Image from 'next/image'
import { normalizeText } from 'normalize-text'

export default function SpiritualityCharism() {
  const { title, quote, categories } = attributes as PageSpiritualityCharism

  const categoriesData = categories.map((category) => ({
    ...category,
    url: `/spirituality/charism/${normalizeText(category.title).replaceAll(
      /\s/g,
      '-'
    )}`,
  }))

  return (
    <AppPage>
      <h1 className="sr-only">{title}</h1>

      <blockquote className="relative bg-primary-200 rounded-lg p-8">
        <div className="relative z-10">
          <p className="text-xl text-gray-800 md:text-3xl md:leading-normal">
            <em>
              {quote}
            </em>
          </p>
        </div>
      </blockquote>

      <AppTimelineCards className="mt-12" cards={categoriesData} />
    </AppPage>
  )
}
