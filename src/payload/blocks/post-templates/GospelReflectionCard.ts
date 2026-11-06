import { authorField, markdownField, spotifyUrlField } from "@/payload/fields";
import { Block } from "payload";

const GospelReflectionCardBlock: Block = {
  slug: "gospelReflectionCard",
  labels: {
    singular: "Suy Niệm Lời Chúa - Thẻ Tích Hợp",
    plural: "Suy Niệm Lời Chúa - Thẻ Tích Hợp",
  },
  imageURL: "/images/template-previews/gospel-reflection-card.webp",
  imageAltText: "Thẻ suy niệm tích hợp podcast Spotify và Lời Chúa",
  interfaceName: "GospelReflectionCardBlock",
  fields: [
    {
      name: "liturgyMeta",
      type: "text",
      label: "Thời gian & Tuần phụng vụ",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: THỨ HAI, 14/09/2026 — Tuần XXIV Mùa Thường Niên",
      },
    },
    {
      name: "headline",
      type: "text",
      label: "Tiêu đề bài suy niệm",
      localized: true,
      admin: {
        placeholder:
          "Ví dụ: Trên Thánh Giá, Thiên Chúa nói với nhân loại bằng tình yêu",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Hình minh họa (Tùy chọn)",
      required: false,
    },
    {
      name: "imageCaption",
      type: "text",
      label: "Chú thích hình",
      localized: true,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.image),
      },
    },
    spotifyUrlField(),
    {
      name: "gospel",
      type: "group",
      label: "Trích đoạn Tin Mừng (Mở rộng / Popup)",
      fields: [
        {
          name: "reference",
          type: "text",
          label: "Đoạn Tin Mừng",
          localized: true,
          admin: {
            placeholder: "Ví dụ: Ga 3,13-17",
          },
        },
        markdownField({
          name: "content",
          label: "Nội dung Tin Mừng",
          localized: true,
          admin: {
            description:
              "Số câu Kinh Thánh viết dạng chỉ số trên bằng thẻ <sup>, ví dụ: <sup>13</sup> Không ai đã lên trời…",
          },
        }),
      ],
    },
    markdownField({
      name: "body",
      label: "Nội dung suy niệm",
      required: true,
      localized: true,
    }),
    authorField(),
    {
      name: "audioReader",
      type: "text",
      label: "Giọng đọc",
      localized: true,
    },
  ],
};

export default GospelReflectionCardBlock;
