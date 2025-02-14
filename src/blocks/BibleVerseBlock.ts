import { Block } from 'payload'

const BibleVerseBlock: Block = {
  slug: 'bibleVerseBlock',
  labels: {
    singular: 'Bible Verse',
    plural: 'Bible Verses',
  },
  fields: [
    {
      name: 'verse',
      type: 'text',
      required: true,
    },
    {
      name: 'reference',
      type: 'text',
      required: true,
    },
  ],
}

export default BibleVerseBlock
