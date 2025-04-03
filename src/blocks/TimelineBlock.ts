import { Block } from 'payload'

const TimelineBlock: Block = {
  slug: 'timelineBlock',
  labels: {
    singular: 'Timeline',
    plural: 'Timelines',
  },
  interfaceName: 'TimelineBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
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
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
        }
      ],
    }
  ],
}

export default TimelineBlock
