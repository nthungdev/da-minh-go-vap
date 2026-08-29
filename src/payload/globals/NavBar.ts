import { MENU_ICON_OPTIONS } from "@/definitions/menu-icons";
import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";
import { Field, GlobalConfig } from "payload";

const linkFields: Field[] = [
  {
    name: "linkType",
    label: "Link Type",
    type: "radio",
    required: true,
    options: [
      {
        label: "None",
        value: "none",
      },
      {
        label: "Internal Page",
        value: "internal",
      },
      {
        label: "External URL",
        value: "external",
      },
    ],
    defaultValue: "none",
    admin: {
      layout: "horizontal",
    },
  },
  {
    name: "internalLink",
    label: "Internal Page",
    type: "relationship",
    relationTo: "pages",
    admin: {
      condition: (_, siblingData) => siblingData.linkType === "internal",
    },
    validate: linkValidation("internal"),
  },
  {
    name: "externalLink",
    label: "External URL",
    type: "text",
    admin: {
      condition: (_, siblingData) => siblingData.linkType === "external",
    },
    validate: linkValidation("external"),
  },
];

const NavBar: GlobalConfig = {
  slug: "navBar",
  access: {
    read: onlyRoles(["admin", "manager"]),
    update: onlyRoles(["admin", "manager"]),
  },
  typescript: {
    interface: "NavBar",
  },
  fields: [
    {
      name: "bottomDecorativeGraphic",
      type: "group",
      fields: [
        {
          name: "enable",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "imageDesktop",
          type: "upload",
          relationTo: "media",
          required: true,
          localized: true,
        },
        {
          name: "imageMobile",
          type: "upload",
          relationTo: "media",
          required: true,
          localized: true,
        },
      ],
      admin: {
        description: "Hình trang trí bên dưới thanh điều hướng",
      },
    },
    {
      name: "menu",
      type: "array",
      required: true,
      minRows: 0,
      fields: [
        {
          name: "label",
          label: "Nhãn menu",
          type: "text",
          localized: true,
          validate: labelValidation,
          admin: {
            description:
              "Nhãn hiển thị của mục menu (tùy chọn nếu đã chọn biểu tượng).",
          },
        },
        {
          name: "icon",
          label: "Biểu tượng (Icon)",
          type: "select",
          options: [...MENU_ICON_OPTIONS],
          validate: iconValidation,
          admin: {
            description:
              "Biểu tượng hiển thị phía trước nhãn menu (tùy chọn nếu đã nhập nhãn).",
          },
        },
        ...linkFields,
        {
          name: "layout",
          label: "Bố cục menu con",
          type: "select",
          required: true,
          defaultValue: "grid",
          options: [
            {
              label: "Lưới thẻ (Tiêu đề + Mô tả)",
              value: "grid",
            },
            {
              label: "Cột chủ đề (Banner ảnh + Nút con + Thanh chân trang)",
              value: "pillars",
            },
            {
              label: "Sidebar danh mục + Lưới bài viết theo Thẻ",
              value: "tabs-posts",
            },
          ],
          admin: {
            description:
              "Chọn kiểu bố cục hiển thị menu con khi mở rộng trên máy tính.",
          },
        },
        // Layout 1: Grid (Default)
        {
          name: "subMenu",
          label: "Menu con (Dạng lưới)",
          type: "array",
          admin: {
            condition: (_, siblingData) =>
              !siblingData.layout || siblingData.layout === "grid",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              localized: true,
            },
            {
              name: "icon",
              label: "Biểu tượng (Icon)",
              type: "upload",
              relationTo: "media",
              admin: {
                description: "Biểu tượng tùy chọn cho mục thẻ lưới.",
              },
            },
            {
              name: "description",
              label: "Mô tả ngắn",
              type: "textarea",
              localized: true,
              admin: {
                description: "Mô tả ngắn hiển thị dưới tiêu đề trong thẻ lưới.",
              },
            },
            ...linkFields,
            {
              name: "subMenu",
              type: "array",
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  localized: true,
                },
                ...linkFields,
              ],
            },
          ],
        },
        // Layout 2: Pillars (Cột chủ đề)
        {
          name: "pillars",
          label: "Các cột chủ đề (Pillars)",
          type: "array",
          admin: {
            condition: (_, siblingData) => siblingData.layout === "pillars",
            description:
              "Thêm các cột chủ đề với banner ảnh và các nút liên kết con.",
          },
          fields: [
            {
              name: "headerBanner",
              label: "Banner đầu cột",
              type: "group",
              fields: [
                {
                  name: "title",
                  label: "Tiêu đề banner",
                  type: "text",
                  required: true,
                  localized: true,
                },
                {
                  name: "subtitle",
                  label: "Mô tả phụ banner",
                  type: "text",
                  localized: true,
                },
                {
                  name: "image",
                  label: "Ảnh nền banner",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  localized: true,
                },
                ...linkFields,
              ],
            },
            {
              name: "links",
              label: "Danh sách nút con",
              type: "array",
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  localized: true,
                },
                ...linkFields,
              ],
            },
          ],
        },
        {
          name: "bottomBar",
          label: "Thanh chân trang (Dưới các cột)",
          type: "group",
          admin: {
            condition: (_, siblingData) => siblingData.layout === "pillars",
          },
          fields: [
            {
              name: "label",
              label: "Tiêu đề nhóm chân trang",
              type: "text",
              defaultValue: "Sứ vụ khác",
              localized: true,
            },
            {
              name: "links",
              label: "Danh sách nút chân trang",
              type: "array",
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  localized: true,
                },
                ...linkFields,
              ],
            },
          ],
        },
        // Layout 3: Tabs + Posts (Sidebar danh mục + Lưới bài viết)
        {
          name: "categories",
          label: "Danh mục Sidebar & Thẻ bài viết",
          type: "array",
          admin: {
            condition: (_, siblingData) => siblingData.layout === "tabs-posts",
            description:
              "Thêm các mục danh mục bên trái và gắn Thẻ để tự động lấy các bài viết mới nhất.",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              localized: true,
            },
            ...linkFields,
            {
              name: "tags",
              label: "Thẻ bài viết liên kết",
              type: "relationship",
              relationTo: "hiddenTags",
              hasMany: true,
              required: true,
              admin: {
                description:
                  "Chọn các thẻ bài viết để hiển thị lưới bài viết tương ứng.",
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/")],
  },
};

function labelValidation(
  val: unknown,
  {
    siblingData,
  }: {
    siblingData: Partial<{
      label?: string | null;
      icon?: string | null;
    }>;
  },
) {
  const hasLabel =
    typeof val === "string" ? val.trim().length > 0 : Boolean(val);
  const hasIcon = Boolean(siblingData?.icon);
  if (!hasLabel && !hasIcon) {
    return "Phải nhập nhãn hoặc chọn biểu tượng";
  }
  return true;
}

function iconValidation(
  val: unknown,
  {
    siblingData,
  }: {
    siblingData: Partial<{
      label?: string | null;
      icon?: string | null;
    }>;
  },
) {
  const hasIcon = Boolean(val);
  const hasLabel =
    typeof siblingData?.label === "string"
      ? siblingData.label.trim().length > 0
      : Boolean(siblingData?.label);
  if (!hasIcon && !hasLabel) {
    return "Phải nhập nhãn hoặc chọn biểu tượng";
  }
  return true;
}

function linkValidation(linkType: "internal" | "external") {
  return function (
    val: unknown,
    {
      siblingData,
    }: {
      siblingData: Partial<{
        linkType?: "none" | "internal" | "external";
      }>;
    },
  ) {
    if (siblingData.linkType === linkType && !val) {
      return "This field is required";
    }
    return true;
  };
}

export default NavBar;
