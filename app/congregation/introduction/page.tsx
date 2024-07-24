import { attributes } from '@/content/pages/congregation/introduction.md'
import AppMarkdown from '@/components/app-markdown'
import Image from 'next/image';
import Link from 'next/link';
import AppPage from '@/components/app-page';

const AboutSection = ({ content }: Readonly<{
  content: AboutUsSection;
}>) => {
  const hasVideos = content.videos.videos?.length > 0

  return (
    <section id='about-section' className='space-y-4'>
      {content.banner &&
        <Image
          src={content.banner}
          width={600}
          height={200}
          alt="Banner"
          className='mb-4'
        />
      }

      <h2 className="text-2xl">{content.title}</h2>

      <AppMarkdown >{content.body}</AppMarkdown>

      {content.tabs.map(({ title, body }) => (
        <section key={title}>
          <h3 className='text-xl'>{title}</h3>
          <AppMarkdown>{body}</AppMarkdown>
        </section>
      ))}

      {hasVideos && (
        <section>
          <h3 className='text-xl'>{content.videos.title}</h3>
          <ul className='mt-2 flex flex-row space-x-4'>
            {
              content.videos.videos?.map(({ title, youtubeUrl, thumbnail }, index) => (
                <li key={index}>
                  <Link
                    href={youtubeUrl}
                    className='inline-block'
                    target='_blank'
                  >
                    <div className='inline-block rounded-lg overflow-hidden border-2 w-[256px] hover:ring-2'>
                      <Image
                        className='w-full'
                        src={thumbnail}
                        width={256}
                        height={144}
                        alt={`${title}'s thumbnail`}
                      />
                      <h5 className='text-center py-2 px-2 truncate'>{title}</h5>
                    </div>
                  </Link>
                </li>
              ))
            }
          </ul>
        </section>
      )}
    </section>
  )
}

const MissionSection = ({ content }: Readonly<{
  content: MissionSection;
}>) => {
  const hasVideos = content.videos.videos?.length > 0

  return (
    <section id='mission-section' className='space-y-4'>
      {content.banner &&
        <Image
          src={content.banner}
          width={600}
          height={200}
          alt="Banner"
          className='mb-4'
        />
      }

      <h2 className='text-2xl'>{content.title}</h2>

      <AppMarkdown>{content.body}</AppMarkdown>

      {content.tabs.map(({ title, body }) => (
        <section key={title}>
          <h3 className='text-xl'>{title}</h3>
          <AppMarkdown>{body}</AppMarkdown>
        </section>
      ))}

      {hasVideos && (
        <section>
          <h3>{content.videos.title}</h3>
          <ul className='mt-2 flex flex-row space-x-4'>
            {
              content.videos.videos?.map(({ title, youtubeUrl, thumbnail }, index) => (
                <li key={index}>
                  <Link
                    href={youtubeUrl}
                    className='inline-block'
                    target='_blank'
                  >
                    <div className='inline-block rounded-lg overflow-hidden border-2 w-[256px] hover:ring-2'>
                      <Image
                        className='w-full'
                        src={thumbnail}
                        width={256}
                        height={144}
                        alt={`${title}'s thumbnail`}
                      />
                      <h5 className='text-center py-2 px-2 truncate'>{title}</h5>
                    </div>
                  </Link>
                </li>
              ))
            }
          </ul>
        </section>
      )}
    </section>
  )
}

const WhereaboutsSection = ({ content }: Readonly<{
  content: WhereaboutsSection;
}>) => {
  return (
    <section id='whereabouts-section' className='space-y-4'>
      {content.banner &&
        <Image
          src={content.banner}
          width={600}
          height={200}
          alt="Banner"
        />
      }

      <h2 className='text-2xl'>{content.title}</h2>

      <AppMarkdown >{content.body}</AppMarkdown>

      {(content.countries || []).map(({ name, body }) => (
        <section key={name}>
          <h3 className='text-xl'>{name}</h3>
          <AppMarkdown>{body}</AppMarkdown>
        </section>
      ))}
    </section>
  )
}

export default function CongregationIntroduction() {
  const { aboutUs, mission, whereabouts } = attributes as CongregationAbout

  return (
    <AppPage className="space-y-12">
      <AboutSection content={aboutUs} />
      <MissionSection content={mission} />
      <WhereaboutsSection content={whereabouts} />
    </AppPage>
  )
}
