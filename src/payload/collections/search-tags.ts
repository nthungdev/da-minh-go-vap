import type { CollectionConfig } from "payload";
import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";

const SearchTags: CollectionConfig = {
  slug: "searchTags",
  labels: {
    singular: {
      en: "Search Tag",
      vi: "Thẻ tìm kiếm",
    },
    plural: {
      en: "Search Tags",
      vi: "Thẻ tìm kiếm",
    },
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "tag", "order", "enabled"],
  },
  access: {
    read: () => true,
    create: onlyRoles(["admin", "manager", "editor"]),
    update: onlyRoles(["admin", "manager", "editor"]),
    delete: onlyRoles(["admin", "manager", "editor"]),
  },
  fields: [
    {
      name: "tag",
      type: "relationship",
      relationTo: "hiddenTags",
      required: true,
      unique: true,
      label: {
        en: "Tag",
        vi: "Thẻ",
      },
    },
    {
      name: "label",
      type: "text",
      localized: true,
      label: {
        en: "Display Label",
        vi: "Tên hiển thị",
      },
      admin: {
        description:
          "Tên hiển thị trên thanh tìm kiếm (để trống sẽ dùng tên gốc của thẻ).",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: {
        en: "Order",
        vi: "Thứ tự",
      },
    },
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      label: {
        en: "Enabled",
        vi: "Hiển thị",
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/", ["searchTags", "navBar"])],
    afterDelete: [() => revalidatePath("/", ["searchTags", "navBar"])],
  },
};

export default SearchTags;
