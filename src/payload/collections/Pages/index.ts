import AccordionContentBlock from "@/payload/blocks/AccordionContentBlock";
import BibleVerseBlock from "@/payload/blocks/BibleVerseBlock";
import DynamicImageBlock from "@/payload/blocks/DynamicImageBlock";
import ImageSlideshowBlock from "@/payload/blocks/image-slideshow-block";
import ImageBlock from "@/payload/blocks/ImageBlock";
import LatestPostGridBlock from "@/payload/blocks/LatestPostGridBlock";
import LinksBlock from "@/payload/blocks/links-block";
import MapBlock from "@/payload/blocks/MapBlock";
import PostGroupBlock from "@/payload/blocks/PostGroupBlock";
import QuoteBlock from "@/payload/blocks/QuoteBlock";
import SpaceBlock from "@/payload/blocks/SpaceBlock";
import TabbedContentBlock from "@/payload/blocks/TabbedContentBlock";
import TabbedPostGroupBlock from "@/payload/blocks/TabbedPostGroupBlock";
import TextBlock from "@/payload/blocks/TextBock";
import TimelineBlock from "@/payload/blocks/TimelineBlock";
import VideoGridBlock from "@/payload/blocks/VideoGridBlock";
import type { CollectionConfig } from "payload";

const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
  },
  // access: {
  // read: () => ({
  //   publishedAt: {
  //     greater_than: new Date(),
  //   },
  // }),
  // },
  fields: [
    {
      name: "publishedAt",
      type: "date",
      label: "Thời gian công bố",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "path",
      type: "text",
      label: "Đường dẫn",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description:
          'Đường dẫn sẽ được sử dụng để truy cập trang này. Ví dụ: "/gioi-thieu".',
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Main",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Tiêu đề",
              required: true,
            },
            {
              name: "main",
              type: "blocks",
              blocks: [
                AccordionContentBlock,
                BibleVerseBlock,
                DynamicImageBlock,
                ImageBlock,
                LatestPostGridBlock,
                MapBlock,
                PostGroupBlock,
                TabbedContentBlock,
                TabbedPostGroupBlock,
                TextBlock,
                TimelineBlock,
                VideoGridBlock,
                SpaceBlock,
                QuoteBlock,
              ],
            },
          ],
        },
        {
          label: "Before Main",
          fields: [
            {
              name: "banners",
              type: "upload",
              relationTo: "media",
              required: false,
              unique: false,
              hasMany: true,
            },
            {
              name: "beforeMain",
              type: "blocks",
              blocks: [BibleVerseBlock],
            },
          ],
        },
        {
          label: "Aside",
          fields: [
            {
              name: "aside",
              type: "blocks",
              blocks: [
                DynamicImageBlock,
                ImageBlock,
                ImageSlideshowBlock,
                PostGroupBlock,
                TabbedContentBlock,
                TextBlock,
                SpaceBlock,
                QuoteBlock,
                LinksBlock,
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default Pages;
