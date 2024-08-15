import AppPage from '@/components/app-page'
import TheBanner from '@/components/the-banner'
import { attributes } from '@/content/pages/spirituality/charism.md'
import Image from 'next/image'
import Link from 'next/link';
import { normalizeText } from 'normalize-text';

export default function SpiritualityCharism() {
  const { title, banners, quote, categories } = attributes as PageSpiritualityCharism

  const categoriesData = categories.map(category => ({
    ...category,
    url: `/spirituality/charism/${normalizeText(category.title).replaceAll(/\s/g, '-')}`
  }))

  return (
    <AppPage>
      <h1 className='sr-only'>{title}</h1>

      <div className='space-y-12'>
        <TheBanner banners={banners} />

        <div>
          {quote}
        </div>

        <div className='space-y-8'>
          {categoriesData.map((category, index) => (
            <div key={index} className='space-y-2'>
              <Link href={category.url}>
                <div className='relative aspect-video max-w-sm'>
                  <Image
                    src={category.thumbnail.url}
                    alt={category.thumbnail.alt}
                    className='w-full rounded-lg object-cover'
                    fill
                  />
                </div>
              </Link>
              <h2 className='text-xl font-semibold'>{category.title}</h2>
            </div>
          ))}
        </div>
      </div>
    </AppPage>
  )
}