import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";
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
    {
      name: "isPublic",
      type: "checkbox",
      label: "Hiển thị công khai",
      defaultValue: false,
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/", ["hiddenTags", "posts", "navBar"])],
  },
};

export default HiddenTags;
