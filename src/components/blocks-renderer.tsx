import BlockRenderer from '@/components/block-renderer'
import { BlockType } from '@/definitions'

const BlocksRenderer = ({ blocks }: { blocks: BlockType[] }) => {
  return (
    <div>
      {blocks.map((block, index) => (
        <BlockRenderer block={block} key={index} />
      ))}
    </div>
  )
}

export default BlocksRenderer
