import { Block } from 'payload'

const TabbedPostGroupBlock: Block = {
  slug: 'tabbedPostGroupBlock',
  labels: {
    singular: 'Tabbed Post Group',
    plural: 'Tabbed Post Groups',
  },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'hiddenTags',
          type: 'relationship',
          relationTo: 'hiddenTags',
          hasMany: true,
          required: true,
          unique: true,
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 6,
          // locked to 6 until other values are supported
          access: {
            update: () => false,
            create: () => false,
            read: () => true,
          }
        },
        {
          name: 'viewMoreButton',
          type: 'group',
          fields: [
            {
              name: 'enableViewMoreButton',
              type: 'checkbox',
              defaultValue: false,
              required: true,
            },
            {
              name: 'relativeUrl',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: false,
            },
          ],
        },
      ],
    },
  ],
}

export default TabbedPostGroupBlock
