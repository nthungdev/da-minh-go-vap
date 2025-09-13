import { Block } from "payload";

const LinksBlock: Block = {
  slug: "linksBlock",
  labels: {
    singular: "Links",
    plural: "Links",
  },
  interfaceName: "LinksBlock",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "links",
      type: "array",
      required: true,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
          hasMany: false,
          required: true,
          admin: {
            description:
              "Hình ảnh hiển thị để bấm vào mở liên kết. Hình ảnh sẽ được hiển thị trong khung tỷ lệ 4:1.",
          },
        },
      ],
    },
  ],
};

export default LinksBlock;
