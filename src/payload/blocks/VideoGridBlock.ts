import { Block } from "payload";

const VideoGridBlock: Block = {
  slug: "videoGridBlock",
  labels: {
    singular: "Video Grid",
    plural: "Video Grids",
  },
  interfaceName: "VideoGridBlock",
  fields: [
    {
      name: "videos",
      type: "array",
      required: true,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
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
      ],
    },
  ],
};

export default VideoGridBlock;
