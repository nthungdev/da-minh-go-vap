import Image from 'next/image'
import { attributes } from '@/content/settings/footer.md'
import Markdown from 'react-markdown'
import Link from 'next/link'

export default function TheFooter() {
  const { name, address, email, marketingEmail, phone, externalLinks, graphic } =
    attributes as SettingsFooter

  const splitExternalLinks = (links: any[], chunkSize: number) => {
    const result: any[][] = []
    for (let i = 0; i < links.length; i += chunkSize) {
      result.push(links.slice(i, i + chunkSize))
    }
    return result
  }

  const chunkedExternalLinks = splitExternalLinks(externalLinks, 4)

  return (
    <footer className="relative">
      <Image
        src={graphic.url}
        alt="Footer background"
        className="w-full z-0 pointer-events-none select-none"
        height={229}
        width={991}
        sizes="100%"
      />

      <div className="bg-[#427CA8]">
        <div className='p-4 max-w-screen-xl sm:hidden flex flex-col md:flex-row gap-8 text-white text-left'>
          <div>
            <p className="font-bold mb-1">{name}</p>
            <Markdown>{address}</Markdown>
            <p>
              Đt: <a href={`tel:${phone}`}>{phone}</a>
            </p>
            <p>
              Email: <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p>
              Ban truyền thông:{' '}
              <a href={`mailto:${marketingEmail}`}>{marketingEmail}</a>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-x-4">
            {chunkedExternalLinks.map((chunk, index) => (
              <div key={index} className="flex flex-col justify-end">
                {chunk.map((link, index) => (
                  <div key={index}>
                    <Link href={link.url}>{link.name}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* layout for large screens */}
      <div className="hidden sm:flex flex-col md:flex-row absolute left-0 bottom-0 px-4 py-4 max-w-screen-xl gap-8 text-white text-left text-[0.9vw] 3xl:text-xl">
        <div>
          <p className="font-bold mb-1">{name}</p>
          {/* <p>{address}</p> */}
          <Markdown>{address}</Markdown>
          <p>
            Đt: <a href={`tel:${phone}`}>{phone}</a>
          </p>
          <p>
            Email: <a href={`mailto:${email}`}>{email}</a>
          </p>
          <p>
            Ban truyền thông:{' '}
            <a href={`mailto:${marketingEmail}`}>{marketingEmail}</a>
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-x-4">
          {chunkedExternalLinks.map((chunk, index) => (
            <div key={index} className="flex flex-col justify-end">
              {chunk.map((link, index) => (
                <div key={index}>
                  <Link href={link.url}>{link.name}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
