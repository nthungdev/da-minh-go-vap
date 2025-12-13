import { onlyRoles } from "@/payload/utils/access-control";
import { CollectionConfig } from "payload";

const HiddenTags: CollectionConfig = {
  slug: "hiddenTags",
  admin: {
    useAsTitle: "label",
  },
  access: {
    read: () => true,
    update: onlyRoles(["admin", "manager"]),
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
