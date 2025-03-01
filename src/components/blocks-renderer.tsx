import AppCardTabs from '@/components/app-card-tabs'
import AppMarkdown from '@/components/app-markdown'
import AppSpace from '@/components/app-space'
import AppTabbedPostGroup from '@/components/app-tabbed-post-group'
import TheBibleVerse from '@/components/the-bible-verse'
import TheLatestPosts from '@/components/the-latest-posts'
import { BlockType } from '@/definitions'

const componentsMap: {
  [key in BlockType['blockType']]?: React.ComponentType<any>
} = {
  bibleVerseBlock: TheBibleVerse,
  tabbedPostGroupBlock: AppTabbedPostGroup,
  spaceBlock: AppSpace,
  latestPostGridBlock: TheLatestPosts,
  tabbedContentBlock: AppCardTabs,
  textBlock: AppMarkdown,
}

function mapComponentProps(block: BlockType) {
  switch (block.blockType) {
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

    default:
      return null
  }
}

const BlocksRenderer = ({ blocks }: { blocks: BlockType[] }) => {
  return (
    <div>
      {blocks.map((block, index) => {
        const Component = componentsMap[block.blockType]
        if (!Component) return null
        return <Component key={index} {...mapComponentProps(block)!} />
      })}
    </div>
  )
}

export default BlocksRenderer
