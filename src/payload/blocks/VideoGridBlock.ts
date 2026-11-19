import type { Block } from "payload";

const VideoGridBlock: Block = {
  slug: "videoGridBlock",
  labels: {
    singular: "Video Grid",
    plural: "Video Grids",
  },
  interfaceName: "VideoGridBlock",
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
    },
    {
      name: "videos",
      type: "array",
      required: true,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            {
              label: "YouTube",
              value: "youtube",
            },
            {
              label: "Facebook",
              value: "facebook",
            },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
        {
          name: "isShort",
          type: "checkbox",
          defaultValue: false,
          label: "YouTube Short (9:16)",
          admin: {
            description:
              "Set this when a YouTube Short is entered as a bare ID.",
          },
        },
      ],
    },
  ],
};

export default VideoGridBlock;
