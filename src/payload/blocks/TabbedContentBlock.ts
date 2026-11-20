import type { Block } from "payload";
import markdownField from "@/payload/fields/markdown";

const TabbedContentBlock: Block = {
  slug: "tabbedContentBlock",
  labels: {
    singular: "Tabbed Content",
    plural: "Tabbed Contents",
  },
  interfaceName: "TabbedContentBlock",
  fields: [
    {
      name: "tabs",
      type: "array",
      required: true,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
        },
        markdownField({
          name: "content",
          required: true,
          localized: true,
        }),
      ],
    },
  ],
};

export default TabbedContentBlock;
