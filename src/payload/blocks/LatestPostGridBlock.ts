import { Block } from "payload";

const LatestPostGridBlock: Block = {
  slug: "latestPostGridBlock",
  labels: {
    singular: "Latest Post Grid",
    plural: "Latest Post Grids",
  },
  interfaceName: "LatestPostGridBlock",
  fields: [
    {
      type: "radio",
      label: "Số bài viết",
      name: "postCount",
      admin: {
        description:
          "Để cân xứng, chọn 5 nếu hiển thị trong layout 1 cột, 4 cho trong layout 2 cột.",
      },
      defaultValue: "4",
      options: [
        { label: "4", value: "4" },
        { label: "5", value: "5" },
      ],
    },
  ],
};

export default LatestPostGridBlock;
