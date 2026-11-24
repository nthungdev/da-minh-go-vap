import type { Block } from "payload";
import { markdownField } from "@/payload/fields";
import { validateOptionalHttpUrl } from "@/utils/safe-url";

const TributeProfileBlock: Block = {
  slug: "tributeProfile",
  interfaceName: "TributeProfileBlock",
  labels: {
    singular: "Hồ Sơ Tri Ân / Tiểu Sử Nhân Vật",
    plural: "Hồ Sơ Tri Ân / Tiểu Sử Nhân Vật",
  },
  imageURL: "/images/template-previews/tribute-profile.webp",
  imageAltText: "Hồ sơ tri ân: Chân dung, thông tin tóm tắt, tiểu sử và nguồn",
  fields: [
    {
      name: "fullName",
      type: "text",
      required: true,
      localized: true,
      label: "Danh xưng & Họ tên",
      admin: {
        placeholder: "Ví dụ: Đức Ông Marie Bertrand Cothonay",
      },
    },
    {
      name: "subtitle",
      type: "text",
      localized: true,
      label: "Tên gọi khác / Chức vụ",
      admin: {
        placeholder: "Ví dụ: (Còn gọi là Đức ông Cothonay Chiểu, O.P.)",
      },
    },
    {
      name: "portrait",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Ảnh chân dung",
    },
    {
      name: "summaryFacts",
      type: "array",
      label: "Thông tin tóm tắt",
      labels: { singular: "Mục thông tin", plural: "Các mục thông tin" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              localized: true,
              label: "Nhãn",
              admin: {
                placeholder: "Ví dụ: Sinh, Linh mục, Nhiệm kỳ, Qua đời",
              },
            },
            {
              name: "value",
              type: "text",
              required: true,
              localized: true,
              label: "Nội dung",
              admin: {
                placeholder: "Ví dụ: 27.12.1854",
              },
            },
          ],
        },
      ],
    },
    {
      name: "biographyHeading",
      type: "text",
      localized: true,
      label: "Tiêu đề phần tiểu sử",
      admin: {
        placeholder: "Mặc định: Tiểu sử",
      },
    },
    markdownField({
      name: "biography",
      label: "Tiểu sử",
      required: true,
      localized: true,
    }),
    {
      name: "sources",
      type: "array",
      label: "Nguồn tham khảo",
      labels: { singular: "Nguồn", plural: "Các nguồn" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              localized: true,
              label: "Tên nguồn",
              admin: {
                placeholder:
                  "Ví dụ: Văn khố Hội dòng nữ Đa Minh Gò Vấp hoặc gcatholic.org",
              },
            },
            {
              name: "url",
              type: "text",
              label: "Đường dẫn (tùy chọn)",
              validate: validateOptionalHttpUrl,
              admin: {
                placeholder: "https://...",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default TributeProfileBlock;
