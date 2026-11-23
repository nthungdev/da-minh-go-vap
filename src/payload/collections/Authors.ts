import type { CollectionConfig } from "payload";
import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";

const authorEditors = onlyRoles(["admin", "manager", "editor", "author"]);

const Authors: CollectionConfig = {
  slug: "authors",
  labels: {
    singular: {
      en: "Author",
      vi: "Tác giả",
    },
    plural: {
      en: "Authors",
      vi: "Tác giả",
    },
  },
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
    create: authorEditors,
    update: authorEditors,
    delete: authorEditors,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: {
        en: "Name",
        vi: "Tên",
      },
      required: true,
      localized: true,
    },
    {
      name: "honorific",
      type: "text",
      label: {
        en: "Honorific",
        vi: "Danh xưng",
      },
      localized: true,
      admin: {
        description: "Ví dụ: Lm., Tu sĩ",
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/", ["posts"])],
  },
};

export default Authors;
