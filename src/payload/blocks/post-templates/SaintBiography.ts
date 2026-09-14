import { markdownField } from "@/payload/fields";
import { Block } from "payload";

const SaintBiographyBlock: Block = {
  slug: "saintBiography",
  labels: {
    singular: "Tiểu Sử Thánh",
    plural: "Tiểu Sử Thánh",
  },
  imageURL: "/svgs/template-previews/saint-biography.svg",
  imageAltText: "Tiểu sử Thánh: Chân dung, Dòng thời gian, Gương nhân đức",
  interfaceName: "SaintBiographyBlock",
  fields: [
    {
      name: "saintName",
      type: "text",
      label: "Tên vị thánh",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: THÁNH GIOAN KIM KHẨU",
      },
    },
    {
      name: "saintTitle",
      type: "text",
      label: "Tước hiệu",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: Giám mục - Tiến sĩ Hội Thánh",
      },
    },
    {
      name: "feastDay",
      type: "text",
      label: "Ngày kính nhớ",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: Kính nhớ ngày 13/9",
      },
    },
    {
      name: "portrait",
      type: "upload",
      relationTo: "media",
      label: "Hình ảnh vị thánh",
      required: true,
    },
    {
      name: "mainContent",
      type: "group",
      label: "Nội dung chính",
      fields: [
        {
          name: "timeline",
          type: "array",
          label: "1. Dòng thời gian cuộc đời",
          required: true,
          fields: [
            {
              name: "periodOrYear",
              type: "text",
              label: "Mốc thời gian / Giai đoạn",
              required: true,
              localized: true,
              admin: {
                placeholder: "Ví dụ: Năm 347, Xuất thân, Thụ phong linh mục",
              },
            },
            {
              name: "description",
              type: "text",
              label: "Mô tả sự kiện",
              required: true,
              localized: true,
            },
          ],
        },
        {
          name: "virtues",
          type: "array",
          label: "2. Gương nhân đức & Giáo huấn",
          required: true,
          fields: [
            {
              name: "title",
              type: "text",
              label: "Tiêu đề",
              required: true,
              localized: true,
              admin: {
                placeholder: "Ví dụ: Người cha của người nghèo",
              },
            },
            markdownField({
              name: "body",
              label: "Nội dung",
              required: true,
              localized: true,
            }),
          ],
        },
        markdownField({
          name: "prayer",
          label: "3. Lời nguyện cùng vị thánh",
          localized: true,
        }),
      ],
    },
    markdownField({
      name: "references",
      label: "Tài liệu tham khảo",
      localized: true,
    }),
  ],
};

export default SaintBiographyBlock;
