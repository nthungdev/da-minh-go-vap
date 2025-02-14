import markdownField from '@/fields/markdown'
import { Block } from 'payload'

const TabbedContentBlock: Block = {
  slug: 'tabbedContentBlock',
  labels: {
    singular: 'Tabbed Content Block',
    plural: 'Tabbed Content Blocks',
  },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          ...markdownField('body'),
          name: 'content',
          required: true,
        },
      ],
    }
  ],
}

export default TabbedContentBlock
