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

        <div className='gap-y-8 flex flex-col'>
          {categoriesData.map((category, index) => (
            <Link key={index} href={category.url} className={`space-y-2 w-1/2 hover:ring-2 rounded-lg ${index % 2 ? 'self-end' : ''}`}>
              <div className='relative aspect-video w-full'>
                <Image
                  src={category.thumbnail.url}
                  alt={category.thumbnail.alt}
                  className='w-full rounded-lg object-cover'
                  fill
                />
              </div>
              <h2 className='text-xl font-semibold px-2 pb-1 text-center'>{category.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </AppPage>
  )
}