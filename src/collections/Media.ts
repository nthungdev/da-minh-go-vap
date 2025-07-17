import type { CollectionConfig } from "payload";

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    staticDir: "media",
    imageSizes: [
      {
        width: 300,
        height: 300,
        name: "thumbnail-square",
      },
      {
        width: 90,
        height: 90,
        name: "thumbnail-square-mobile",
      },
    ],
  },
};

export default Media;
