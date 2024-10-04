import AppPage from '@/components/app-page'
import AppSectionHeader from '@/components/app-section-header'
import AppTimelineCards from '@/components/app-timeline-cards'
import { attributes } from '@/content/pages/spirituality/charism.md'
import Image from 'next/image'
import { normalizeText } from 'normalize-text'

export default function SpiritualityCharism() {
  const { title, quote, pillars } = attributes as PageSpiritualityCharism

  const categoriesData = pillars.categories.map((category) => ({
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
            <em>{quote}</em>
          </p>
        </div>
      </blockquote>

      <section className="mt-12 space-y-4">
        <AppSectionHeader className="text-2xl">{pillars.title}</AppSectionHeader>
        <AppTimelineCards className="" cards={categoriesData} />
      </section>
    </AppPage>
  )
}
