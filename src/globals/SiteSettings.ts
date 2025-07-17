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
};

export default SiteSettings;
