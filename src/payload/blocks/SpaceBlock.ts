import { Block } from "payload";

const SpaceBlock: Block = {
  slug: "spaceBlock",
  labels: {
    singular: "Space",
    plural: "Spaces",
  },
  interfaceName: "SpaceBlock",
  fields: [
    {
      name: "size",
      type: "number",
      required: true,
    },
  ],
};

export default SpaceBlock;
