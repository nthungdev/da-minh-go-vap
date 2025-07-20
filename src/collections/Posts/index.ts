import markdownField from "@/fields/markdown";
import { validateSlug } from "@/utils/slug";
import type { CollectionConfig } from "payload";

const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Tiêu đề",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      hasMany: false,
      unique: true,
      validate: validateSlug,
      admin: {
        position: "sidebar",
        description:
          "Can only use letters (a-z, A-Z), numbers (0-9), and dashes (-, _)",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Thời gian công bố",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "hiddenTags",
      type: "relationship",
      relationTo: "hiddenTags",
      hasMany: true,
      defaultValue: [],
      required: true,
    },
    {
      name: "thumbnail",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "videos",
      type: "array",
      defaultValue: [],
      fields: [
        {
          name: "title",
          type: "text",
          label: "Tiêu đề",
          required: true,
        },
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "Youtube", value: "youtube" },
            { label: "Facebook", value: "facebook" },
          ],
        },
        {
          name: "videoId",
          type: "text",
          label: "Video ID",
          required: true,
          admin: {
            description:
              "Ví dụ với YouTube, URL là https://www.youtube.com/watch?v=GnX7TN3uo5g thì Video ID là GnX7TN3uo5g. Với Facebook, URL là https://www.facebook.com/watch/?v=123456789 thì Video ID là 123456789.",
          },
        },
      ],
    },
    {
      ...markdownField("body"),
      required: true,
    },
  ],
};

export default Posts;
