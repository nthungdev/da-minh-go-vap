import { revalidatePath } from "@/payload/utils/data";
import { GlobalConfig } from "payload";

const Footer: GlobalConfig = {
  slug: "footer",
  fields: [
    {
      name: "topFooterDecorativeGraphic",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "contact",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "address",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "phone",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "email",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "marketingEmail",
          type: "text",
          localized: true,
        },
      ],
    },
    {
      name: "externalLinks",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/")],
  },
};

export default Footer;
