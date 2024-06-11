import {
  attributes,
  body,
} from '@/content/pages/congregation/introduction.md'
import AppMarkdown from '@/components/app-markdown'

const AboutSection = ({ aboutUs }:  Readonly<{
  aboutUs: AboutUsSection;
}>) => {
  return (
    <section>
      <h3 className="text-xl">{aboutUs.title}</h3>
      <AppMarkdown>{aboutUs.body}</AppMarkdown>
      {aboutUs.tabs.map(({ title, body }) => (
        <div key={title}>
          <h4>{title}</h4>
          <AppMarkdown>{body}</AppMarkdown>
        </div>
      ))}
      <h4>Video giới thiệu</h4>
      {/* TODO */}
    </section>
  )
}

export default function CongregationIntroduction() {
  const { aboutUs, mission, whereabouts } = attributes as CongregationAbout

  return (
    <main className="space-y-4">
      {/* <AboutSection aboutUs={aboutUs} /> */}

      <section>
        {/* TODO format as tabs */}
        {aboutUsTabs.map(({ title, content }) => (
          <div key={title}>
            <h3 className="text-xl">{title}</h3>
            <AppMarkdown>{content}</AppMarkdown>
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-xl">Video giới thiệu</h3>
        {/* TODO */}
      </section>

      <section>
        <h3 className="text-xl">Nhiệm vụ</h3>
      </section>
    </main>
  )
}
