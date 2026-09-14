import { markdownField } from "@/payload/fields";
import { Block } from "payload";

const EventGalleryReportBlock: Block = {
  slug: "eventGalleryReport",
  labels: {
    singular: "Bản Tin Sự Kiện & Thư Viện Ảnh",
    plural: "Bản Tin Sự Kiện & Thư Viện Ảnh",
  },
  interfaceName: "EventGalleryReportBlock",
  fields: [
    {
      name: "eventTitle",
      type: "text",
      label: "Tiêu đề sự kiện",
      required: true,
      localized: true,
      admin: {
        placeholder: "Ví dụ: NHỊP CẦU YÊU THƯƠNG",
      },
    },
    {
      name: "eventSubtitle",
      type: "text",
      label: "Chủ đề / Phụ đề sự kiện",
      localized: true,
      admin: {
        placeholder:
          "Ví dụ: Tổng kết môn học Nghệ thuật tương tác và xây dựng cộng đoàn",
      },
    },
    {
      name: "sections",
      type: "array",
      label: "Các phần nội dung & Bộ ảnh",
      required: true,
      fields: [
        markdownField({
          name: "narrative",
          label: "Nội dung tường thuật",
          localized: true,
        }),
        {
          name: "photos",
          type: "array",
          label: "Thư viện ảnh",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "Hình ảnh",
              required: true,
            },
            {
              name: "caption",
              type: "text",
              label: "Chú thích ảnh",
              localized: true,
            },
          ],
        },
        {
          name: "columns",
          type: "select",
          label: "Số cột hiển thị ảnh",
          required: true,
          defaultValue: "2",
          options: [
            { label: "2 Cột (2 Columns)", value: "2" },
            { label: "3 Cột (3 Columns)", value: "3" },
            { label: "4 Cột (4 Columns)", value: "4" },
          ],
        },
      ],
    },
    {
      name: "credits",
      type: "text",
      label: "Thông tin ban truyền thông / tác giả",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Ban Truyền thông Thỉnh viện Têrêsa",
      },
    },
  ],
};

export default EventGalleryReportBlock;
