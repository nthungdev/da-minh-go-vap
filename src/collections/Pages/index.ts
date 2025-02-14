import PostGroupBlock from '@/blocks/PostGroupBlock'
import TextBlock from '@/blocks/TextBock'
import markdownField from '@/fields/markdown'
import type { CollectionConfig } from 'payload'

const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Thời gian công bố',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'hiddenTags',
      type: 'relationship',
      relationTo: 'hiddenTags',
      hasMany: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [
        TextBlock, PostGroupBlock,
      ]
    }
  ],
}

export default Pages
