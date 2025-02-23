import markdownField from '@/fields/markdown'
import { Block } from 'payload'

const TabbedContentBlock: Block = {
  slug: 'tabbedContentBlock',
  labels: {
    singular: 'Tabbed Content',
    plural: 'Tabbed Contents',
  },
  interfaceName: 'TabbedContentBlock',
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
          ...markdownField('content'),
          required: true,
        },
      ],
    }
  ],
}

export default TabbedContentBlock
