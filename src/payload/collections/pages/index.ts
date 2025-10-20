import { Page } from "@/payload-types";
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
import { buildPagePreviewUrl } from "@/payload/utils/config";
import { revalidatePath } from "@/payload/utils/data";
import type { CollectionConfig } from "payload";

const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: {
      en: "Page",
      vi: "Trang",
    },
    plural: {
      en: "Pages",
      vi: "Các trang",
    },
  },
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) => {
        return buildPagePreviewUrl(data.path);
      },
    },
  },
  fields: [
    {
      type: "group",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "publishedAt",
          type: "date",
          label: "Thời gian công bố",
          required: true,
          admin: {
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
            description:
              'Đường dẫn sẽ được sử dụng để truy cập trang này. Luôn bắt đầu bằng "/". Ví dụ: "/gioi-thieu".',
          },
        },
        {
          name: "requireHttpBasicAuth",
          label: "Bảo mật trang",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Cần mật khẩu để truy cập trang này.",
          },
        },
      ],
    },

    {
      type: "tabs",
      tabs: [
        {
          label: {
            en: "Main",
            vi: "Nội dung chính",
          },
          fields: [
            {
              name: "title",
              type: "text",
              label: "Tiêu đề",
              required: true,
              localized: true,
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
          label: {
            en: "Before main",
            vi: "Trước nội dung chính",
          },
          fields: [
            {
              name: "banners",
              type: "upload",
              relationTo: "media",
              required: false,
              unique: false,
              hasMany: true,
              localized: true,
            },
            {
              name: "showBannersDecorativeGraphic",
              type: "checkbox",
              label: "Hiển thị hình trang trí đè lên banner",
              defaultValue: false,
              admin: {
                description: "Tùy chỉnh hình trang trí ở mục Nav Bar",
              },
            },
            {
              name: "beforeMain",
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
          label: {
            en: "Aside (right)",
            vi: "Bên cạnh (phải)",
          },
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
        {
          label: "SEO",
          name: "seo",
          fields: [
            {
              type: "text",
              name: "title",
              virtual: "title",
              localized: true,
              access: {
                update: () => false,
              },
              admin: {
                description: "Dùng chung với tiêu đề của mục Nội Dung",
              },
            },
            {
              type: "text",
              name: "description",
              localized: true,
              admin: {
                description: "Mô tả ngắn về trang",
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async function ({ doc }: { doc: Page }) {
        await revalidatePath(doc.path);
      },
    ],
  },
};

export default Pages;
