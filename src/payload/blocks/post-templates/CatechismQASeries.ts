import { markdownField } from "@/payload/fields";
import { Block } from "payload";

const CatechismQASeriesBlock: Block = {
  slug: "catechismQASeries",
  labels: {
    singular: "Hiểu Để Yêu - Chuyên Đề Giáo Lý",
    plural: "Hiểu Để Yêu - Chuyên Đề Giáo Lý",
  },
  imageURL: "/svgs/template-previews/catechism-qa-series.svg",
  imageAltText: "Hỏi đáp giáo lý theo từng chủ đề và biểu tượng",
  interfaceName: "CatechismQASeriesBlock",
  fields: [
    {
      name: "title",
      type: "text",
      label: "Tiêu đề câu hỏi / Vấn đề",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: AMEN LÀ GÌ?",
      },
    },
    markdownField({
      name: "introduction",
      label: "Lời mở đầu / Dẫn nhập",
      required: true,
      localized: true,
    }),
    {
      name: "items",
      type: "array",
      label: "Các phần trả lời & giải thích",
      required: true,
      fields: [
        {
          name: "icon",
          type: "text",
          label: "Biểu tượng / Emoji",
          defaultValue: "📖",
          admin: {
            placeholder: "Ví dụ: 📖, 📜, ✝️, 💡",
          },
        },
        {
          name: "title",
          type: "text",
          label: "Tiêu đề mục",
          required: true,
          localized: true,
          admin: {
            placeholder: "Ví dụ: Nguồn gốc từ “Amen”, Trong Cựu Ước",
          },
        },
        markdownField({
          name: "body",
          label: "Nội dung giải thích",
          required: true,
          localized: true,
        }),
      ],
    },
    {
      name: "credits",
      type: "text",
      label: "Đơn vị thực hiện / Ban Mục vụ",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Ban Mục vụ Giáo lý Hội Dòng",
      },
    },
  ],
};

export default CatechismQASeriesBlock;
