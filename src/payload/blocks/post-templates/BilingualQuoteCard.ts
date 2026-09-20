import { authorField } from "@/payload/fields";
import { Block } from "payload";

const BilingualQuoteCardBlock: Block = {
  slug: "bilingualQuoteCard",
  labels: {
    singular: "Danh Ngôn Song Ngữ",
    plural: "Danh Ngôn Song Ngữ",
  },
  imageURL: "/svgs/template-previews/bilingual-quote-card.svg",
  imageAltText: "Danh ngôn song ngữ đối chiếu song song (Anh - Việt)",
  interfaceName: "BilingualQuoteCardBlock",
  fields: [
    authorField({
      label: "Tác giả danh ngôn",
      required: true,
      admin: {
        placeholder: "Ví dụ: Đào Hoàng Diệu",
      },
    }),
    {
      name: "source",
      type: "text",
      label: "Nguồn trích dẫn / Tác phẩm",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Trích từ sách Sayings Of Youth, trang 87",
      },
    },
    {
      name: "original",
      type: "group",
      label: "Cột bản gốc",
      fields: [
        {
          name: "language",
          type: "text",
          label: "Tên ngôn ngữ",
          required: true,
          defaultValue: "English",
        },
        {
          name: "quote",
          type: "text",
          label: "Nội dung câu nói gốc",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          label: "Chú thích cột",
          defaultValue: "Bản gốc tiếng Anh",
        },
      ],
    },
    {
      name: "translation",
      type: "group",
      label: "Cột bản dịch",
      fields: [
        {
          name: "language",
          type: "text",
          label: "Tên ngôn ngữ",
          required: true,
          defaultValue: "Tiếng Việt",
        },
        {
          name: "quote",
          type: "text",
          label: "Nội dung câu nói dịch",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          label: "Chú thích cột",
          defaultValue: "Bản dịch tiếng Việt",
        },
      ],
    },
  ],
};

export default BilingualQuoteCardBlock;
