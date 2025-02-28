import AppSpace from '@/components/app-space'
import AppTabbedPostGroup from '@/components/app-tabbed-post-group'
import TheBibleVerse from '@/components/the-bible-verse'
import { BlockType } from '@/definitions'

const componentsMap: {
  [key in BlockType['blockType']]?: React.ComponentType<any>
} = {
  bibleVerseBlock: TheBibleVerse,
  tabbedPostGroupBlock: AppTabbedPostGroup,
  spaceBlock: AppSpace,
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

    case 'tabbedPostGroupBlock':
      return {
        title: block.title,
        groups: (block.tabs as any[]).map((tab) => ({
          title: tab.title,
          hiddenTags: tab.hiddenTags.map((t: any) => t.tag),
        })),
      }

    case 'spaceBlock':
      return {
        size: block.size,
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
