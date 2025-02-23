import markdownField from '@/fields/markdown'
import { Block } from 'payload'

const QuoteBlock: Block = {
  slug: 'quoteBlock',
  labels: {
    singular: 'Quote',
    plural: 'Quotes',
  },
  interfaceName: 'QuoteBlock',
  fields: [
    {
      ...markdownField('content'),
      required: true,
    },
  ],
}

export default QuoteBlock
