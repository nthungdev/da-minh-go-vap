import type { Block } from "payload";
import { markdownField } from "@/payload/fields";
import { validateOptionalHttpUrl } from "@/utils/safe-url";

const NewsArticleFeaturedBlock: Block = {
  slug: "newsArticleFeatured",
  labels: {
    singular: "Bản Tin Giáo Hội & Ảnh Nổi",
    plural: "Bản Tin Giáo Hội & Ảnh Nổi",
  },
  imageURL: "/images/template-previews/news-article-featured.webp",
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
      name: "translator",
      type: "text",
      label: "Chuyển ngữ",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Paulthem, CSC",
      },
    },
    {
      name: "audioReader",
      type: "text",
      label: "Giọng đọc",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Nữ tu Theresa Phùng Thị Huệ",
      },
    },
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
      validate: validateOptionalHttpUrl,
      admin: {
        placeholder: "https://...",
      },
    },
  ],
};

export default NewsArticleFeaturedBlock;
