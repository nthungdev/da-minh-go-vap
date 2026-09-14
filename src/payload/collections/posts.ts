import { locales } from "@/i18n/config";
import { Post } from "@/payload-types";
import { pageBlocks } from "@/payload/blocks";
import { postTemplates } from "@/payload/blocks/post-templates";
import {
  markdownField,
  publishedAtField,
  videoSourceFields,
} from "@/payload/fields";
import { postsReadAccess } from "@/payload/utils/access-control";
import { buildPostPreviewUrl } from "@/payload/utils/config";
import { slugify } from "@/payload/utils/data";
import Fuses from "@/utils/fuses";
import { postToAppPost } from "@/utils/post";
import { validateSlug } from "@/utils/slug";
import type {
  CollectionAfterChangeHook,
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
    livePreview: {
      url: ({ data }) => {
        return buildPostPreviewUrl(data.slug);
      },
    },
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Nội Dung",
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
                ...videoSourceFields({
                  selectOverrides: {
                    options: [
                      { label: "Youtube", value: "youtube" },
                      { label: "Facebook", value: "facebook" },
                    ],
                  },
                  videoIdOverrides: {
                    admin: {
                      description:
                        "Ví dụ với YouTube, URL là https://www.youtube.com/watch?v=GnX7TN3uo5g thì Video ID là GnX7TN3uo5g. Với Facebook, URL là https://www.facebook.com/watch/?v=123456789 thì Video ID là 123456789.",
                    },
                  },
                }),
              ],
            },
            {
              name: "contentMode",
              type: "radio",
              label: "Chế độ nội dung",
              defaultValue: "markdown",
              options: [
                { label: "Văn bản thường (Markdown)", value: "markdown" },
                { label: "Mẫu định dạng sẵn (Template)", value: "template" },
                { label: "Ghép khối tự do (Blocks)", value: "blocks" },
              ],
              admin: {
                layout: "horizontal",
              },
            },
            {
              name: "template",
              type: "blocks",
              label: "Mẫu giao diện bài viết",
              maxRows: 1,
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.contentMode === "template",
                description:
                  "Chọn 1 mẫu giao diện phù hợp để nhập nội dung theo cấu trúc.",
              },
              blocks: postTemplates,
            },
            {
              name: "contentBlocks",
              type: "blocks",
              label: "Các khối nội dung tự do",
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.contentMode === "blocks",
                description: "Tự do ghép các khối nội dung theo nhu cầu.",
              },
              blocks: pageBlocks,
            },
            markdownField({
              name: "body",
              label: "Nội dung",
              required: false,
              localized: true,
              admin: {
                condition: (_, siblingData) =>
                  !siblingData?.contentMode ||
                  siblingData?.contentMode === "markdown",
              },
              validate: (value, { siblingData }) => {
                const data = siblingData as Partial<Post> | undefined;
                if (
                  (!data?.contentMode || data?.contentMode === "markdown") &&
                  !value
                ) {
                  return "Vui lòng nhập nội dung bài viết";
                }
                return true;
              },
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
        },
        {
          label: "SEO",
          name: "seo",
          fields: [
            {
              type: "text",
              name: "title",
              virtual: "title",
              localized: true,
              access: {
                update: () => false,
              },
              admin: {
                description: "Dùng chung với tiêu đề của mục Nội Dung",
              },
            },
            {
              type: "text",
              name: "description",
              localized: true,
              admin: {
                description: "Mô tả ngắn về bài viết",
              },
            },
            {
              name: "keywords",
              type: "text",
              hasMany: true,
              localized: true,
            },
          ],
        },
      ],
    },

    {
      type: "group",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "slug",
          type: "text",
          label: "Slug",
          required: true,
          hasMany: false,
          unique: true,
          index: true,
          validate: validateSlug,
          admin: {
            description:
              "Can only use letters (a-z, A-Z), numbers (0-9), and dashes (-, _)",
          },
          hooks: {
            beforeValidate: [autoGenerateSlug],
            beforeDuplicate: [duplicateSlug],
          },
        },
        publishedAtField(),
        {
          name: "requireHttpBasicAuth",
          label: "Bảo mật trang",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Cần mật khẩu để truy cập bài viết này.",
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [updateFuse],
  },
};

async function updateFuse({
  doc,
  operation,
}: Parameters<CollectionAfterChangeHook<Post>>[0]) {
  locales.forEach(async (locale) => {
    const post = postToAppPost(doc);
    if (operation === "create") {
      Fuses.instance.addPost(post, locale);
    } else if (operation === "update") {
      Fuses.instance.replacePost(post, locale);
    }
  });
}

function duplicateTitle({ value }: FieldHookArgs): ReturnType<FieldHook> {
  return `[Duplicate] ${value}`;
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
