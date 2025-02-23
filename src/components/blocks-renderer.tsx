import TheBibleVerse from '@/components/the-bible-verse'

const componentsMap = {
  bibleVerseBlock: TheBibleVerse,
}

function mapComponentProps(block: any) {
  if (block.blockType === 'bibleVerseBlock') {
    return {
      verses: [
        {
          verse: block.verse as string,
          reference: block.reference as string,
        },
      ],
    }
  } else {
    // TODO
    return null
  }
}

const BlocksRenderer = ({ blocks }: { blocks: any[] }) => {
  return (
    <div>
      {blocks.map((block: { blockType: keyof typeof componentsMap }, index) => {
        const Component = componentsMap[block.blockType]
        if (!Component) return null
        return <Component key={index} {...mapComponentProps(block)!} />
      })}
    </div>
  )
}

export default BlocksRenderer
