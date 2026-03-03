import { transformUrl } from "@/utils/cloudflare";
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
    adminThumbnail: ({ doc }) => {
      console.log({ doc });
      return transformUrl(doc.filename as string, { width: "80" });
    },
  },
};

export default Media;
