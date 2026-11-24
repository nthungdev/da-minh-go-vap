import type {
  CollectionAfterChangeHook,
  CollectionConfig,
  FieldHook,
  FieldHookArgs,
} from "payload";
import { pageBlocks } from "@/payload/blocks";
import { postTemplates } from "@/payload/blocks/post-templates";
import {
  markdownField,
  publishedAtField,
  videoSourceFields,
} from "@/payload/fields";
import {
  onlyRoles,
  postsDeleteAccess,
  postsReadAccess,
  stampCreatedBy,
} from "@/payload/utils/access-control";
import { buildPostPreviewUrl } from "@/payload/utils/config";
import { revalidatePath, slugify } from "@/payload/utils/data";
import type { Post } from "@/payload-types";
import { contributorRoles } from "@/utils/post-contributors";
import { validateSlug } from "@/utils/slug";

const contributorRoleLabels: Record<
  (typeof contributorRoles)[number],
  { en: string; vi: string }
> = {
  author: { en: "Author", vi: "Tác giả" },
  translator: { en: "Translator", vi: "Chuyển ngữ" },
  narrator: { en: "Narrator", vi: "Giọng đọc" },
  editor: { en: "Editor", vi: "Biên tập" },
  presenter: { en: "Presenter", vi: "Trình bày" },
  producer: { en: "Producer", vi: "Thực hiện" },
  photographer: { en: "Photographer", vi: "Hình ảnh" },
};

const contributorRoleOptions = contributorRoles.map((role) => ({
  value: role,
  label: contributorRoleLabels[role],
}));

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
    create: onlyRoles(["admin", "manager", "editor", "author"]),
    update: onlyRoles(["admin", "manager", "editor", "author"]),
    delete: postsDeleteAccess,
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
              name: "showTableOfContents",
              type: "checkbox",
              label: "Hiển thị mục lục",
              defaultValue: false,
              admin: {
                description:
                  "Tự động tạo mục lục từ các tiêu đề H2, H3 trong nội dung bài viết.",
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
              validate: (value, { siblingData }) => {
                const data = siblingData as Partial<Post> | undefined;
                if (
                  data?.contentMode === "template" &&
                  (!Array.isArray(value) || value.length === 0)
                ) {
                  return "Vui lòng chọn một mẫu giao diện bài viết";
                }
                return true;
              },
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
              validate: (value, { siblingData }) => {
                const data = siblingData as Partial<Post> | undefined;
                if (
                  data?.contentMode === "blocks" &&
                  (!Array.isArray(value) || value.length === 0)
                ) {
                  return "Vui lòng thêm ít nhất một khối nội dung";
                }
                return true;
              },
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
            {
              name: "contributors",
              type: "array",
              label: {
                en: "Contributors",
                vi: "Người đóng góp",
              },
              labels: {
                singular: {
                  en: "Contributor",
                  vi: "Người đóng góp",
                },
                plural: {
                  en: "Contributors",
                  vi: "Người đóng góp",
                },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "person",
                      type: "relationship",
                      relationTo: "contributors",
                      required: true,
                      label: {
                        en: "Person",
                        vi: "Người",
                      },
                    },
                    {
                      name: "role",
                      type: "select",
                      required: true,
                      defaultValue: "author",
                      options: contributorRoleOptions,
                      label: {
                        en: "Role",
                        vi: "Vai trò",
                      },
                    },
                  ],
                },
              ],
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
        {
          name: "createdBy",
          type: "relationship",
          relationTo: "users",
          index: true,
          label: {
            en: "Created By",
            vi: "Người tạo",
          },
          access: {
            // Prevent non-admins from spoofing or reassigning post ownership
            create: onlyRoles(["admin"]),
            update: onlyRoles(["admin"]),
          },
          hooks: {
            beforeDuplicate: [({ req }) => req.user?.id],
          },
          admin: {
            description: "Tự động gán theo tài khoản tạo bài viết.",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [stampCreatedBy],
    afterChange: [revalidatePost],
  },
};

async function revalidatePost({
  doc,
}: Parameters<CollectionAfterChangeHook<Post>>[0]) {
  await revalidatePath(`/posts/${doc.slug}`, ["posts", "navBar", "pages"]);
  await revalidatePath("/", ["posts", "navBar", "pages"]);
}

/**
 * Safely prepends [Duplicate] to the title only if an original title exists for that locale.
 * If the source document did not define a title for this locale (e.g. secondary locale left empty),
 * it returns undefined instead of forcing '[Duplicate] undefined'.
 */
function duplicateTitle({ value }: FieldHookArgs): ReturnType<FieldHook> {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return `[Duplicate] ${value}`;
}

function autoGenerateSlug({ value, siblingData }: FieldHookArgs) {
  if (!value) {
    return slugify(siblingData.title || "");
  }
  return value;
}

function duplicateSlug({ value }: FieldHookArgs): ReturnType<FieldHook> {
  if (!value || typeof value !== "string") {
    return value;
  }
  const characters = 4;
  const uniqueSuffix = Math.random().toString(36).slice(-characters);
  return `${value}-${uniqueSuffix}`;
}

export default Posts;
