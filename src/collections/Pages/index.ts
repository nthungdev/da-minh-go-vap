import AccordionContentBlock from "@/blocks/AccordionContentBlock";
import BibleVerseBlock from "@/blocks/BibleVerseBlock";
import DynamicImageBlock from "@/blocks/DynamicImageBlock";
import ImageSlideshowBlock from "@/blocks/image-slideshow-block";
import ImageBlock from "@/blocks/ImageBlock";
import LatestPostGridBlock from "@/blocks/LatestPostGridBlock";
import LinksBlock from "@/blocks/links-block";
import MapBlock from "@/blocks/MapBlock";
import PostGroupBlock from "@/blocks/PostGroupBlock";
import QuoteBlock from "@/blocks/QuoteBlock";
import SpaceBlock from "@/blocks/SpaceBlock";
import TabbedContentBlock from "@/blocks/TabbedContentBlock";
import TabbedPostGroupBlock from "@/blocks/TabbedPostGroupBlock";
import TextBlock from "@/blocks/TextBock";
import TimelineBlock from "@/blocks/TimelineBlock";
import VideoGridBlock from "@/blocks/VideoGridBlock";
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
