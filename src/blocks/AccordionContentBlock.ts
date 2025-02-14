import markdownField from '@/fields/markdown'
import { Block } from 'payload'

const AccordionContentBlock: Block = {
  slug: 'AccordionContentBlock',
  labels: {
    singular: 'Accordion',
    plural: 'Accordions',
  },
  fields: [
    {
      name: 'items',
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
        {
          name: 'children',
          type: 'array',
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
            {
              name: 'children',
              type: 'array',
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
      ],
    }
  ],
}

export default AccordionContentBlock
