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
      name: 'content',
      type: 'text',
      required: true,
    }
  ],
}

export default QuoteBlock
