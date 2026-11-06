import { markdownField } from "@/payload/fields";
import { Block } from "payload";

const KidsBibleStoryBlock: Block = {
  slug: "kidsBibleStory",
  labels: {
    singular: "Bé Và Lời - Câu Chuyện Kinh Thánh",
    plural: "Bé Và Lời - Câu Chuyện Kinh Thánh",
  },
  imageURL: "/images/template-previews/kids-bible-story.webp",
  imageAltText:
    "Câu chuyện Kinh Thánh cho thiếu nhi kèm điểm ghi nhớ và câu vàng",
  interfaceName: "KidsBibleStoryBlock",
  fields: [
    {
      name: "episodeLabel",
      type: "text",
      label: "Nhãn chuyên mục / Số tập",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Bé và Lời — số 23",
      },
    },
    {
      name: "title",
      type: "text",
      label: "Tiêu đề câu chuyện",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: Ngôn sứ Êlia – Người dám đứng về phía Chúa",
      },
    },
    {
      name: "subtitle",
      type: "text",
      label: "Phụ đề / Thông điệp ngắn",
      required: true,
      localized: true,
      admin: {
        placeholder:
          "Ví dụ: Dù chỉ có một mình, Êlia vẫn can đảm tin tưởng Thiên Chúa...",
      },
    },
    {
      name: "summaryCard",
      type: "group",
      label: "Thẻ tóm tắt / Điểm ghi nhớ",
      fields: [
        markdownField({
          name: "intro",
          label: "Lời dẫn đầu thẻ",
          localized: true,
        }),
        {
          name: "takeaways",
          type: "array",
          label: "Các điểm ghi nhớ",
          fields: [
            {
              name: "text",
              type: "text",
              label: "Điểm ghi nhớ",
              required: true,
              localized: true,
            },
          ],
        },
      ],
    },
    markdownField({
      name: "content",
      label: "Nội dung câu chuyện",
      required: false,
      localized: true,
    }),
    {
      name: "memoryQuote",
      type: "text",
      label: "Lời Chúa ghi nhớ / Câu vàng",
      localized: true,
      admin: {
        placeholder:
          "Ví dụ: “Hãy can đảm làm điều đúng, dù chỉ có một mình, vì Thiên Chúa luôn ở bên ta.”",
      },
    },
    {
      name: "credits",
      type: "group",
      label: "Thông tin thực hiện",
      fields: [
        {
          name: "presenter",
          type: "text",
          label: "Người trình bày",
          localized: true,
          admin: {
            placeholder: "Ví dụ: Nữ tu Maria Nguyễn Thị Thu Thoa",
          },
        },
        {
          name: "productionUnit",
          type: "text",
          label: "Đơn vị thực hiện",
          localized: true,
          admin: {
            placeholder: "Ví dụ: Ban Truyền thông Hội Dòng Nữ Đa Minh Gò Vấp",
          },
        },
      ],
    },
  ],
};

export default KidsBibleStoryBlock;
