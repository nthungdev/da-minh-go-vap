import markdownField from "@/payload/fields/markdown";
import { Post } from "@/payload-types";
import { slugify } from "@/payload/utils/data";
import { validateSlug } from "@/utils/slug";
import type {
  AccessArgs,
  AccessResult,
  CollectionConfig,
  FieldHook,
  FieldHookArgs,
} from "payload";

const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: {
      en: "Post",
      vi: "Bài viết",
    },
    plural: {
      en: "Posts",
      vi: "Bài viết",
    },
  },
  access: {
    read: postsReadAccess,
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Tiêu đề",
      required: true,
      hooks: {
        beforeDuplicate: [duplicateTitle],
      },
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
      hooks: {
        beforeValidate: [autoGenerateSlug],
        beforeDuplicate: [duplicateSlug],
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

function duplicateTitle({ value }: FieldHookArgs): ReturnType<FieldHook> {
  return `[Duplicate] ${value}`;
}

function isCmsPath(pathname: string) {
  return pathname.startsWith("/admin");
}

function postsReadAccess({ req }: AccessArgs<Post>): AccessResult {
  // Allow access to all posts in the admin panel
  if (isCmsPath(req.pathname) && req.user) return true;

  // For public (unauthenticated) access
  return {
    publishedAt: { less_than_equal: new Date().toISOString() },
    and: [
      {
        // title and body can be undefined for unedited locales
        title: { exists: true },
        body: { exists: true },
      },
    ],
  };
}

function autoGenerateSlug({ value, siblingData }: FieldHookArgs) {
  if (!value) {
    return slugify(siblingData.title || "");
  }
  return value;
}

function duplicateSlug({ value }: FieldHookArgs): ReturnType<FieldHook> {
  const characters = 4;
  const uniqueSuffix = Math.random().toString(36).slice(-characters);
  return `${value}-${uniqueSuffix}`;
}

export default Posts;
