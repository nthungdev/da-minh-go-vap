import AppPage from '@/components/app-page'
import { normalizeText } from 'normalize-text'
import { attributes } from '@/content/pages/vocation/introduction.md'
import AppCardTabs from '@/components/app-card-tabs'
import AppTimelineCards from '@/components/app-timeline-cards'

export default function PageVocationIntroduction() {
  const { title, tabSections, sections } = attributes as PageVocationIntroduction

  const tabSectionsData = tabSections.map((tabSection) => ({
    ...tabSection,
    body:
      tabSection.type === 'textTab' ? (
        tabSection.body
      ) : (
        <picture>
          <source
            media="(max-width: 799px)"
            srcSet={tabSection.image.urlMobile}
          />
          <source
            media="(min-width: 800px)"
            srcSet={tabSection.image.urlDesktop}
          />
          <img
            className="w-full"
            src={tabSection.image.urlMobile}
            alt={tabSection.image.alt}
          />
        </picture>
      ),
  }))

  const sectionsData = sections.map((section) => ({
    ...section,
    url: `/vocation/${normalizeText(section.title).replaceAll(/\s/g, '-')}`,
  }))

  return (
    <AppPage className="w-full">
      <h1 className="sr-only">{title}</h1>

      <div className="space-y-12 ">
        <div className="w-full">
          <AppCardTabs tabs={tabSectionsData} />
        </div>
        <AppTimelineCards cards={sectionsData} />
      </div>
    </AppPage>
  )
}
