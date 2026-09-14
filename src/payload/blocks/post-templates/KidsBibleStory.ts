import { markdownField } from "@/payload/fields";
import { Block } from "payload";

const KidsBibleStoryBlock: Block = {
  slug: "kidsBibleStory",
  labels: {
    singular: "Bé Và Lời - Câu Chuyện Kinh Thánh",
    plural: "Bé Và Lời - Câu Chuyện Kinh Thánh",
  },
  interfaceName: "KidsBibleStoryBlock",
  fields: [
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
        {
          name: "intro",
          type: "text",
          label: "Lời dẫn đầu thẻ",
          localized: true,
          admin: {
            placeholder:
              "Ví dụ: Trong chuyên mục Bé và Lời hôm nay, các bạn nhỏ sẽ cùng...",
          },
        },
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
      required: true,
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
