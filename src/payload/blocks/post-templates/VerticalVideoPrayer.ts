import {
  markdownField,
  scriptureGroupField,
  videoGroupField,
} from "@/payload/fields";
import { Block } from "payload";

const VerticalVideoPrayerBlock: Block = {
  slug: "verticalVideoPrayer",
  labels: {
    singular: "Video Dọc & Ý Chỉ Cầu Nguyện",
    plural: "Video Dọc & Ý Chỉ Cầu Nguyện",
  },
  imageURL: "/svgs/template-previews/vertical-video-prayer.svg",
  imageAltText: "Video dọc (9:16) kèm Ý chỉ cầu nguyện và Lời Chúa",
  interfaceName: "VerticalVideoPrayerBlock",
  fields: [
    videoGroupField({
      label: "Video (Tỉ lệ dọc 9:16)",
    }),
    markdownField({
      name: "intentionPrayer",
      label: "Ý chỉ cầu nguyện",
      required: true,
      localized: true,
    }),
    scriptureGroupField({
      name: "scriptureAnchor",
      label: "Câu Lời Chúa đính kèm (Tùy chọn)",
      fieldOptions: {
        verseOverrides: {
          admin: {
            placeholder:
              "ĐỨC CHÚA là Thiên Chúa đem con người đặt vào vườn Êđen...",
          },
        },
        referenceOverrides: {
          admin: {
            placeholder: "St 2,15",
          },
        },
      },
    }),
  ],
};

export default VerticalVideoPrayerBlock;
