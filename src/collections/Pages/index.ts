import PostGroupBlock from '@/blocks/PostGroupBlock'
import TabbedContentBlock from '@/blocks/TabbedContentBlock'
import TextBlock from '@/blocks/TextBock'
import VideoGridBlock from '@/blocks/VideoGridBlock'
import type { CollectionConfig } from 'payload'

const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => ({
      publishedAt: {
        greater_than: new Date(),
      },
    }),
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
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [TextBlock, PostGroupBlock, TabbedContentBlock, VideoGridBlock,],
    },
  ],
}

export default Pages
