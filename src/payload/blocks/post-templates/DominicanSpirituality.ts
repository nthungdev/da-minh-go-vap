import { authorField, markdownField } from "@/payload/fields";
import { Block } from "payload";

const DominicanSpiritualityBlock: Block = {
  slug: "dominicanSpirituality",
  labels: {
    singular: "Linh Đạo & Suy Niệm Đa Minh",
    plural: "Linh Đạo & Suy Niệm Đa Minh",
  },
  interfaceName: "DominicanSpiritualityBlock",
  fields: [
    {
      name: "reflectionTitle",
      type: "text",
      label: "Tiêu đề bài suy niệm",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: SỐNG NĂM THÁNH VỚI CHA THÁNH",
      },
    },
    {
      name: "theme",
      type: "text",
      label: "Chủ đề / Tâm tình",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Kiến tạo cộng đoàn hiệp nhất yêu thương",
      },
    },
    markdownField({
      name: "lead",
      label: "Lời mở đầu / Dẫn tâm tình",
      required: true,
      localized: true,
    }),
    {
      name: "points",
      type: "array",
      label: "Các điểm suy niệm",
      required: true,
      fields: [
        {
          name: "symbol",
          type: "text",
          label: "Ký hiệu đầu mục",
          defaultValue: "❖",
          admin: {
            placeholder: "Ví dụ: ❖, ◆, ✝",
          },
        },
        {
          name: "title",
          type: "text",
          label: "Tiêu đề điểm suy niệm",
          required: true,
          localized: true,
          admin: {
            placeholder: "Ví dụ: Một đời sống ở giữa anh em",
          },
        },
        markdownField({
          name: "content",
          label: "Nội dung suy niệm",
          required: true,
          localized: true,
        }),
        {
          name: "highlightQuote",
          type: "text",
          label: "Câu nói điểm nhấn / Lời dạy của Cha Thánh",
          localized: true,
          admin: {
            placeholder:
              "Ví dụ: “Đừng khóc! Cha sẽ hữu ích cho anh em hơn khi Cha đã về Trời.”",
          },
        },
      ],
    },
    markdownField({
      name: "closingPrayer",
      label: "Lời nguyện kết",
      localized: true,
    }),
    authorField({
      required: true,
      admin: {
        placeholder: "Ví dụ: Nữ tu Maria Vũ Thị Chín (MJC)",
      },
    }),
    {
      name: "authorAffiliation",
      type: "text",
      label: "Đơn vị / Hội dòng",
      defaultValue: "Dòng nữ Đa Minh Gò Vấp",
      localized: true,
    },
  ],
};

export default DominicanSpiritualityBlock;
