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
import { buildPostPreviewUrl } from "@/payload/utils/config";

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
    livePreview: {
      url: ({ data }) => {
        return buildPostPreviewUrl(data.slug);
      },
    },
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
      localized: true,
    },
    {
      name: "hideTitle",
      type: "checkbox",
      label: "Ẩn tiêu đề",
      defaultValue: false,
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
          localized: true,
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
    markdownField({
      name: "body",
      label: "Nội dung",
      required: true,
      localized: true,
    }),
    {
      type: "text",
      name: "shortBody",
      label: "Nội dung ngắn",
      localized: true,
      admin: {
        description: "Chỉ điền 2-3 câu",
      },
    },
  ],
  hooks: {
    // afterChange: [
    //   async ({ operation, doc }) => {
    //     if (operation === "create") {
    //       console.log("add to fuse");
    //       console.log({doc})
    //       const postFuse = await Fuses.instance.getPostFuse()
    //       postFuse.add(doc);
    //     }
    //   },
    // ],
  },
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
