import AppPage from '@/components/app-page'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { attributes } from '@/content/pages/contact/index.md'

export default function PageContact() {
  const { contacts, graphic, title, map } = attributes as PageContact

  const address = contacts.find((contact) => contact.type === 'address')
  const phonesFaxes = contacts.filter(
    (contact) => contact.type === 'phone' || contact.type === 'fax'
  )
  const urls = contacts.filter((contact) => contact.type === 'url')
  const emails = contacts.filter((contact) => contact.type === 'email')

  const iframeSrc = map?.address && `https://www.google.com/maps/embed/v1/search?key=${process.env.GOOGLE_MAPS_EMBED_API_KEY}&q=${map.address}`

  const isVideo = graphic?.url?.includes('.mp4')

  return (
    <AppPage>
      <h1 className="sr-only">{title}</h1>

      <div>
        {isVideo ? (
          <video
            className="w-full"
            src={graphic.url}
            autoPlay
            loop
            muted
          />
        ) : (
          <Image
            className="w-full h-full object-cover"
            src={graphic.url}
            alt={graphic.alt}
            sizes="100%"
            width={256}
            height={144}
          />
        )}
      </div>

      <ul className="mt-8 list-disc list-inside space-y-2 text-lg">
        {address && (
          <li>
            {address.label}: <span className="italic">{address.value}</span>
          </li>
        )}

        {phonesFaxes.length > 0 && (
          <li>
            {phonesFaxes.map((contact, index) => (
              <Fragment key={contact.value}>
                <span className="inline">
                  {contact.label}:{' '}
                  <Link href={`tel:${contact.value}`}>{contact.value}</Link>
                </span>
                {index < phonesFaxes.length - 1 && ' - '}
              </Fragment>
            ))}
          </li>
        )}

        {urls.length > 0 &&
          urls.map((contact) => (
            <li key={contact.value} className="font-semibold">
              {contact.label}: <Link href={contact.value}>{contact.value}</Link>
            </li>
          ))}

        {emails.length > 0 &&
          emails.map((contact) => (
            <li key={contact.value}>
              {contact.label}:{' '}
              <Link href={`mailto:${contact.value}`}>{contact.value}</Link>
            </li>
          ))}
      </ul>

      {map?.address && (
        <div className="mt-8">
          <iframe
            className="w-full aspect-square"
            src={iframeSrc}
            width="600"
            height="450"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </AppPage>
  )
}
