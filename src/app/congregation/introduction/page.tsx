import { attributes } from '@/content/pages/congregation/introduction.md'
import AppMarkdown from '@/components/app-markdown'
import AppPage from '@/components/app-page'
import AppVideoTile from '@/components/app-video-tile'
import AppCardTabs from '@/components/app-card-tabs'
import AppBanners from '@/components/app-banners'

const VideosContainer = ({
  videos,
}: Readonly<{
  videos: { title: string; url: string; thumbnail: string }[]
}>) => (
  <ul className="grid grid-flow-row md:grid-flow-row grid-cols-2 lg:grid-rows-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
    {videos.map(({ title, url, thumbnail }, index) => (
      <li key={index} className='block w-full'>
        <AppVideoTile
          thumbnail={thumbnail}
          title={title}
          videoUrl={url}
          titleComponent="h5"
        />
      </li>
    ))}
  </ul>
)

const AboutSection = ({
  content,
}: Readonly<{
  content: AboutUsSection
}>) => {
  const hasVideos = content.videos.videos?.length > 0

  return (
    <section id="about-section" className="space-y-4">
      {content.banner && <AppBanners banners={[content.banner]} />}

      <h2 className="text-2xl">{content.title}</h2>

      <AppMarkdown>{content.body}</AppMarkdown>

      <AppCardTabs tabs={content.tabs} />

      {hasVideos && (
        <section>
          <h3 className="text-xl mb-2">{content.videos.title}</h3>
          <VideosContainer videos={content.videos.videos} />
        </section>
      )}
    </section>
  )
}

const MissionSection = ({
  content,
}: Readonly<{
  content: MissionSection
}>) => {
  const hasVideos = content.videos.videos?.length > 0

  return (
    <section id="mission-section" className="space-y-4">
      {content.banner && <AppBanners banners={[content.banner]} />}

      <h2 className="text-2xl">{content.title}</h2>

      <AppMarkdown>{content.body}</AppMarkdown>

      <AppCardTabs tabs={content.tabs} />

      {hasVideos && (
        <section>
          <h3 className="mb-2 text-xl">{content.videos.title}</h3>
          <VideosContainer videos={content.videos.videos} />
        </section>
      )}
    </section>
  )
}

const WhereaboutsSection = ({
  content,
}: Readonly<{
  content: WhereaboutsSection
}>) => {
  return (
    <section id="whereabouts-section" className="space-y-4">
      {content.banner && <AppBanners banners={[content.banner]} />}

      <h2 className="text-2xl">{content.title}</h2>

      <AppMarkdown>{content.body}</AppMarkdown>

      <AppCardTabs
        tabs={content.countries.map((c) => ({ title: c.name, body: c.body }))}
      />
    </section>
  )
}

export default function CongregationIntroduction() {
  const { aboutUs, mission, whereabouts } = attributes as PageCongregationAbout

  return (
    <AppPage className="space-y-20 px-4">
      <AboutSection content={aboutUs} />
      <MissionSection content={mission} />
      <WhereaboutsSection content={whereabouts} />
    </AppPage>
  )
}
