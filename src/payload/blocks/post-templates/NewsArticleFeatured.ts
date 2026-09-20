import { markdownField } from "@/payload/fields";
import { Block } from "payload";

const NewsArticleFeaturedBlock: Block = {
  slug: "newsArticleFeatured",
  labels: {
    singular: "Bản Tin Giáo Hội & Ảnh Nổi",
    plural: "Bản Tin Giáo Hội & Ảnh Nổi",
  },
  imageURL: "/svgs/template-previews/news-article-featured.svg",
  imageAltText: "Bản tin nổi bật kèm ảnh lớn, chú thích và nguồn tin",
  interfaceName: "NewsArticleFeaturedBlock",
  fields: [
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      label: "Hình ảnh nổi bật",
      required: true,
    },
    {
      name: "imageCaption",
      type: "text",
      label: "Chú thích ảnh",
      localized: true,
    },
    {
      name: "imageAlignment",
      type: "select",
      label: "Vị trí hình ảnh",
      required: true,
      defaultValue: "left",
      options: [
        { label: "Bên trái (Left)", value: "left" },
        { label: "Bên phải (Right)", value: "right" },
        { label: "Chính giữa (Center)", value: "center" },
      ],
    },
    markdownField({
      name: "content",
      label: "Nội dung bản tin",
      required: true,
      localized: true,
    }),
    {
      name: "sourceName",
      type: "text",
      label: "Tên nguồn tin",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Rome Reports, Vatican News",
      },
    },
    {
      name: "sourceUrl",
      type: "text",
      label: "Link nguồn gốc",
      admin: {
        placeholder: "https://...",
      },
    },
  ],
};

export default NewsArticleFeaturedBlock;
