import { authorField, markdownField, spotifyUrlField } from "@/payload/fields";
import { Block } from "payload";

const GospelReflectionCardBlock: Block = {
  slug: "gospelReflectionCard",
  labels: {
    singular: "Suy Niệm Lời Chúa - Thẻ Tích Hợp",
    plural: "Suy Niệm Lời Chúa - Thẻ Tích Hợp",
  },
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
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Hình minh họa (Tùy chọn)",
      required: false,
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
