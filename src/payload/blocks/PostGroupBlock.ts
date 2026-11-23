import type { Block } from "payload";

const PostGroupBlock: Block = {
  slug: "postGroupBlock",
  labels: {
    singular: "Post Group",
    plural: "Post Groups",
  },
  interfaceName: "PostGroupBlock",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "hidePostTitles",
      label: "Ẩn hiển thị tiêu đề bài viết",
      type: "checkbox",
      defaultValue: false,
      required: true,
    },
    {
      name: "hiddenTags",
      type: "relationship",
      relationTo: "hiddenTags",
      hasMany: true,
      required: true,
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 4,
    },
    {
      name: "viewMoreButton",
      type: "group",
      fields: [
        {
          name: "enableViewMoreButton",
          type: "checkbox",
          defaultValue: false,
          required: true,
        },
        // {
        //   name: 'relativeUrl',
        //   type: 'relationship',
        //   relationTo: 'posts',
        //   hasMany: false,
        // },
      ],
    },
    {
      name: "displayType",
      type: "select",
      required: true,
      defaultValue: "grid",
      options: [
        {
          label: "Grid",
          value: "grid",
        },
        {
          label: "List",
          value: "list",
        },
      ],
    },
    {
      name: "enablePagination",
      label: "Bật phân trang (Inline Pagination)",
      type: "checkbox",
      defaultValue: false,
      admin: {
        condition: (_data, siblingData) => siblingData?.displayType === "grid",
        description:
          "Hiển thị phân trang ngay trong lưới bài viết (chỉ áp dụng cho dạng Grid, dùng Limit làm số bài mỗi trang và ưu tiên hơn nút Xem tiếp).",
      },
    },
  ],
};

export default PostGroupBlock;
