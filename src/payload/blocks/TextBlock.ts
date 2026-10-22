import markdownField from "@/payload/fields/markdown";
import { Block } from "payload";

const TextBlock: Block = {
  slug: "textBlock",
  labels: {
    singular: "Text",
    plural: "Texts",
  },
  interfaceName: "TextBlock",
  fields: [
    markdownField({
      name: "content",
      required: true,
      localized: true,
    }),
  ],
};

export default TextBlock;
