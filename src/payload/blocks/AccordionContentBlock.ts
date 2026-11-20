import type { Block } from "payload";
import markdownField from "@/payload/fields/markdown";

const AccordionContentBlock: Block = {
  slug: "accordionContentBlock",
  labels: {
    singular: "Accordion",
    plural: "Accordions",
  },
  interfaceName: "AccordionContentBlock",
  fields: [
    {
      name: "items",
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
        {
          name: "children",
          type: "array",
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
            {
              name: "children",
              type: "array",
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
        },
      ],
    },
  ],
};

export default AccordionContentBlock;
