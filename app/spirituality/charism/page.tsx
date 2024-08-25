import AppPage from '@/components/app-page'
import AppTimelineCards from '@/components/app-timeline-cards'
import TheBanner from '@/components/the-banner'
import { attributes } from '@/content/pages/spirituality/charism.md'
import Image from 'next/image'
import Link from 'next/link'
import { normalizeText } from 'normalize-text'

export default function SpiritualityCharism() {
  const { title, banners, quote, categories } =
    attributes as PageSpiritualityCharism

  const categoriesData = categories.map((category) => ({
    ...category,
    url: `/spirituality/charism/${normalizeText(category.title).replaceAll(
      /\s/g,
      '-'
    )}`,
  }))

  return (
    <div>
      <TheBanner banners={banners} />

      <AppPage className='pt-4'>
        <h1 className="sr-only">{title}</h1>

        <div className="relative w-full">
          <Image
            src="/images/quote-blue.png"
            alt=""
            className="w-full"
            width={1080}
            height={720}
            quality={100}
            sizes="100%"
          />
          <div className="absolute top-[35%] bottom-[35%] left-0 right-0 mx-[20%] text-sm lg:text-base text-center flex items-center overflow-hidden">
            <p>{quote}</p>
          </div>
        </div>

        <AppTimelineCards className='mt-12' cards={categoriesData} />
      </AppPage>

    </div>
  )
}
