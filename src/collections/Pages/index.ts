import AccordionContentBlock from '@/blocks/AccordionContentBlock'
import BibleVerseBlock from '@/blocks/BibleVerseBlock'
import DynamicImageBlock from '@/blocks/DynamicImageBlock'
import ImageBlock from '@/blocks/ImageBlock'
import MapBlock from '@/blocks/MapBlock'
import PostGroupBlock from '@/blocks/PostGroupBlock'
import QuoteBlock from '@/blocks/QuoteBlock'
import TabbedContentBlock from '@/blocks/TabbedContentBlock'
import TabbedPostGroupBlock from '@/blocks/TabbedPostGroupBlock'
import TextBlock from '@/blocks/TextBock'
import TimelineBlock from '@/blocks/TimelineBlock'
import VideoGridBlock from '@/blocks/VideoGridBlock'
import type { CollectionConfig } from 'payload'

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    // read: () => ({
    //   publishedAt: {
    //     greater_than: new Date(),
    //   },
    // }),
  },
  fields: [
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Thời gian công bố',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'path',
      type: 'text',
      label: 'Đường dẫn',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Main',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề',
              required: true,
            },
            // {
            //   name: 'thumbnail',
            //   type: 'upload',
            //   relationTo: 'media',
            // },
            {
              name: 'main',
              type: 'blocks',
              blocks: [
                AccordionContentBlock,
                BibleVerseBlock,
                DynamicImageBlock,
                ImageBlock,
                MapBlock,
                PostGroupBlock,
                TabbedContentBlock,
                TabbedPostGroupBlock,
                TextBlock,
                TimelineBlock,
                VideoGridBlock,
                QuoteBlock,
              ],
            },
          ],
        },
        {
          label: 'Side',
          fields: [
            {
              name: 'side',
              type: 'blocks',
              blocks: [
                DynamicImageBlock,
                ImageBlock,
                PostGroupBlock,
                TabbedContentBlock,
                TextBlock,
                QuoteBlock,
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default Pages
