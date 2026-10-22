import { onlyRoles } from "@/payload/utils/access-control";
import { transformUrl } from "@/utils/cloudflare";
import type { CollectionConfig } from "payload";

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: onlyRoles(["admin", "manager", "editor", "author"]),
    update: onlyRoles(["admin", "manager", "editor", "author"]),
    delete: onlyRoles(["admin", "manager", "editor", "author"]),
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
    adminThumbnail: ({ doc }) => {
      return transformUrl(doc.filename as string, { width: "80" });
    },
  },
};

export default Media;
