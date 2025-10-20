import { revalidatePath } from "@/payload/utils/data";
import { GlobalConfig } from "payload";

const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  fields: [
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/")],
  },
};

export default SiteSettings;
