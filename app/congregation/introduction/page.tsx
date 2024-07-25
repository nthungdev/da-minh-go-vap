import { attributes } from '@/content/pages/congregation/introduction.md'
import AppMarkdown from '@/components/app-markdown'
import Image from 'next/image';
import AppPage from '@/components/app-page';
import AppVideoTile from '@/components/app-video-tile';

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
                  <AppVideoTile
                    thumbnail={thumbnail}
                    title={title}
                    videoUrl={youtubeUrl}
                    titleComponent='h5'
                  />
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
                  <AppVideoTile
                    thumbnail={thumbnail}
                    title={title}
                    videoUrl={youtubeUrl}
                    titleComponent='h5'
                  />
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
    <AppPage className="space-y-12 px-4">
      <AboutSection content={aboutUs} />
      <MissionSection content={mission} />
      <WhereaboutsSection content={whereabouts} />
    </AppPage>
  )
}
