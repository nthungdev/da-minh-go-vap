import { CollectionConfig } from "payload";

const HiddenTags: CollectionConfig = {
  slug: "hiddenTags",
  admin: {
    useAsTitle: "label",
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Tên",
      required: true,
    },
    {
      name: "tag",
      type: "text",
      label: "tag",
      unique: true,
      required: true,
    },
  ],
};

export default HiddenTags;
