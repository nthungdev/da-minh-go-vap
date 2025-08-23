import { Block } from "payload";

const DynamicImageBlock: Block = {
  slug: "dynamicImageBlock",
  labels: {
    singular: "Dynamic Image",
    plural: "Dynamic Images",
  },
  interfaceName: "DynamicImageBlock",
  fields: [
    {
      name: "desktopImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "mobileImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
  ],
};

export default DynamicImageBlock;
