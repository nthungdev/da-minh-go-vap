import {
  markdownField,
  scriptureFields,
  sourceGroupField,
} from "@/payload/fields";
import { Block } from "payload";

const ParableLifeLessonBlock: Block = {
  slug: "parableLifeLesson",
  labels: {
    singular: "Chuyện Ngụ Ngôn & Bài Học Cuộc Sống",
    plural: "Chuyện Ngụ Ngôn & Bài Học Cuộc Sống",
  },
  imageURL: "/svgs/template-previews/parable-life-lesson.svg",
  imageAltText: "Chuyện ngụ ngôn, câu Lời Chúa và bài học cuộc sống",
  interfaceName: "ParableLifeLessonBlock",
  fields: [
    {
      name: "contents",
      type: "array",
      label: "Các khối nội dung câu chuyện",
      required: true,
      fields: [
        {
          name: "type",
          type: "select",
          label: "Loại nội dung",
          required: true,
          defaultValue: "body",
          options: [
            { label: "Đoạn văn (Body)", value: "body" },
            { label: "Lời Chúa đính kèm (Scripture)", value: "scripture" },
            { label: "Hộp ghi nhớ (Callout)", value: "callout" },
          ],
        },
        markdownField({
          name: "content",
          label: "Nội dung văn bản (Dành cho Đoạn văn hoặc Hộp ghi nhớ)",
          localized: true,
          admin: {
            condition: (_, siblingData) =>
              siblingData?.type === "body" || siblingData?.type === "callout",
          },
        }),
        ...scriptureFields({
          verseOverrides: {
            label: "Câu Lời Chúa (Dành cho Lời Chúa đính kèm)",
            admin: {
              condition: (_, siblingData) => siblingData?.type === "scripture",
              placeholder:
                "Ví dụ: “Thầy không bảo là đến bảy lần, nhưng là đến bảy mươi lần bảy.”",
            },
          },
          referenceOverrides: {
            admin: {
              condition: (_, siblingData) => siblingData?.type === "scripture",
              placeholder: "Ví dụ: Mt 18,21-22",
            },
          },
        }),
      ],
    },
    {
      name: "translator",
      type: "text",
      label: "Người chuyển ngữ / Tác giả",
      localized: true,
      admin: {
        placeholder: "Ví dụ: Nữ tu Maria Nguyễn Thị Mai Hiên",
      },
    },
    sourceGroupField({
      fieldOptions: {
        nameOverrides: {
          admin: {
            placeholder: "Ví dụ: Latter Day Kids",
          },
        },
      },
    }),
  ],
};

export default ParableLifeLessonBlock;
