import markdownField from '@/fields/markdown'
import { Block } from 'payload'

const TextBlock: Block = {
  slug: 'textBlock',
  labels: {
    singular: 'Text Block',
    plural: 'Text Blocks',
  },
  fields: [
    {
      ...markdownField('body'),
      name: 'content',
      required: true,
    },
  ],
}

export default TextBlock
