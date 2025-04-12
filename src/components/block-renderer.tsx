import { AppAccordionDefault } from '@/components/app-accordion'
import AppCardTabs from '@/components/app-card-tabs'
import AppMarkdown from '@/components/app-markdown'
import AppPostGrid from '@/components/app-post-grid-async'
import AppQuote from '@/components/app-quote'
import AppSpace from '@/components/app-space'
import AppTabbedPostGroup from '@/components/app-tabbed-post-group'
import AppTimelineCards from '@/components/app-timeline-cards'
import PostGroup from '@/components/post-group'
import TheBibleVerse from '@/components/the-bible-verse'
import TheLatestPosts from '@/components/the-latest-posts'
import { BlockType } from '@/definitions'

const componentsMap: {
  [key in BlockType['blockType']]?: React.ComponentType<any>
} = {
  accordionContentBlock: AppAccordionDefault,
  bibleVerseBlock: TheBibleVerse,
  latestPostGridBlock: TheLatestPosts,
  postGroupBlock: PostGroup,
  spaceBlock: AppSpace,
  tabbedContentBlock: AppCardTabs,
  tabbedPostGroupBlock: AppTabbedPostGroup,
  textBlock: AppMarkdown,
  timelineBlock: AppTimelineCards,
  quoteBlock: AppQuote,
}

function mapComponentProps(block: BlockType) {
  switch (block.blockType) {
    case 'accordionContentBlock':
      return {
        items: block.items.map((item) => ({
          title: item.title,
          body: item.content,
          items: item.children?.map((subItem) => ({
            title: subItem.title,
            body: subItem.content,
            items: subItem.children?.map((subSubItem) => ({
              title: subSubItem.title,
              body: subSubItem.content,
            })),
          })),
        })),
      }

    case 'bibleVerseBlock':
      return {
        verses: [
          {
            verse: block.verse as string,
            reference: block.reference as string,
          },
        ],
      }

    case 'latestPostGridBlock':
      return {}

    case 'postGroupBlock':
      return {
        title: block.title,
        limit: block.limit,
        hasMore: block.viewMoreButton.enableViewMoreButton,
        hiddenTags: block.hiddenTags
          .filter((tag) => typeof tag !== 'string')
          .map((tag) => tag.tag),
        type: block.displayType,
      }

    case 'tabbedPostGroupBlock':
      return {
        title: block.title,
        groups: (block.tabs as any[]).map((tab) => ({
          title: tab.title,
          hiddenTags: tab.hiddenTags.map((t: any) => t.tag),
        })),
      }

    case 'tabbedContentBlock':
      return {
        tabs: block.tabs.map((t) => ({
          title: t.title,
          body: t.content,
        })),
      }

    case 'spaceBlock':
      return {
        size: block.size,
      }

    case 'textBlock':
      return {
        children: block.content,
      }

    case 'quoteBlock':
      return {
        quote: block.content,
      }

    case 'timelineBlock':
      return {
        title: block.title,
        cards: block.items.map((item) => ({
          title: item.title,
          thumbnail: item.thumbnail,
          url: typeof item.link !== 'string' ? item.link?.path : undefined,
        })),
      }

    default:
      return null
  }
}

const BlockRenderer = ({ block }: { block: BlockType }) => {
  const Component = componentsMap[block.blockType]
  if (!Component) return null
  return <Component {...mapComponentProps(block)!} />
}

export default BlockRenderer
