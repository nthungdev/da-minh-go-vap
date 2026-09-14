import { authorField, markdownField } from "@/payload/fields";
import { Block } from "payload";

const GospelReflectionSplitBlock: Block = {
  slug: "gospelReflectionSplit",
  labels: {
    singular: "Suy Niệm Lời Chúa - Bố Cục Phân Tách",
    plural: "Suy Niệm Lời Chúa - Bố Cục Phân Tách",
  },
  interfaceName: "GospelReflectionSplitBlock",
  fields: [
    {
      name: "liturgyDate",
      type: "text",
      label: "Ngày phụng vụ",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: Thứ Hai, 14/09/2026",
      },
    },
    {
      name: "liturgyWeek",
      type: "text",
      label: "Tuần phụng vụ / Lễ",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: Thứ Hai tuần XXIV Mùa Thường Niên",
      },
    },
    {
      name: "keyVerse",
      type: "text",
      label: "Câu Lời Chúa trọng tâm",
      localized: true,
      admin: {
        placeholder:
          "Ví dụ: “Thiên Chúa yêu thế gian đến nỗi đã ban Con Một...” (Ga 3,16)",
      },
    },
    markdownField({
      name: "reflection",
      label: "Bài suy niệm",
      required: true,
      localized: true,
    }),
    markdownField({
      name: "prayer",
      label: "Lời nguyện kết",
      localized: true,
    }),
    {
      name: "gospel",
      type: "group",
      label: "Bài đọc Tin Mừng",
      fields: [
        {
          name: "passage",
          type: "text",
          label: "Đoạn Tin Mừng",
          required: true,
          localized: true,
          admin: {
            placeholder: "Ví dụ: Ga 3,13-17",
          },
        },
        markdownField({
          name: "reading",
          label: "Nội dung Tin Mừng",
          required: true,
          localized: true,
        }),
        {
          name: "translationCredit",
          type: "text",
          label: "Nguồn bản dịch",
          localized: true,
          admin: {
            placeholder: "Bản dịch của Nhóm Các Giờ Kinh Phụng Vụ",
          },
        },
      ],
    },
    authorField({
      label: "Tác giả bài suy niệm",
    }),
    {
      name: "productionUnit",
      type: "text",
      label: "Đơn vị thực hiện",
      localized: true,
      admin: {
        placeholder: "Ban Truyền thông Dòng Nữ Đa Minh Gò Vấp",
      },
    },
  ],
};

export default GospelReflectionSplitBlock;
