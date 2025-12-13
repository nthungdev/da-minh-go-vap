import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";
import { GlobalConfig } from "payload";

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
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "linkType",
          label: "Link Type",
          type: "radio",
          required: true,
          options: [
            {
              label: "Internal Page",
              value: "internal",
            },
            {
              label: "External URL",
              value: "external",
            },
          ],
          defaultValue: "internal",
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
            {
              name: "linkType",
              label: "Link Type",
              type: "radio",
              required: true,
              options: [
                {
                  label: "Internal Page",
                  value: "internal",
                },
                {
                  label: "External URL",
                  value: "external",
                },
              ],
              defaultValue: "internal",
              admin: { layout: "horizontal" },
            },
            {
              name: "internalLink",
              label: "Internal Page",
              type: "relationship",
              relationTo: "pages",
              admin: {
                condition: (_, siblingData) =>
                  siblingData.linkType === "internal",
              },
              validate: linkValidation("internal"),
            },
            {
              name: "externalLink",
              label: "External URL",
              type: "text",
              admin: {
                condition: (_, siblingData) =>
                  siblingData.linkType === "external",
              },
              validate: linkValidation("external"),
            },
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
                {
                  name: "linkType",
                  label: "Link Type",
                  type: "radio",
                  required: true,
                  options: [
                    {
                      label: "Internal Page",
                      value: "internal",
                    },
                    {
                      label: "External URL",
                      value: "external",
                    },
                  ],
                  defaultValue: "internal",
                  admin: { layout: "horizontal" },
                },
                {
                  name: "internalLink",
                  label: "Internal Page",
                  type: "relationship",
                  relationTo: "pages",
                  admin: {
                    condition: (_, siblingData) =>
                      siblingData.linkType === "internal",
                  },
                  validate: linkValidation("internal"),
                },
                {
                  name: "externalLink",
                  label: "External URL",
                  type: "text",
                  admin: {
                    condition: (_, siblingData) =>
                      siblingData.linkType === "external",
                  },
                  validate: linkValidation("external"),
                },
              ],
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

function linkValidation(linkType: "internal" | "external") {
  return function (
    val: unknown,
    {
      siblingData,
    }: { siblingData: Partial<{ linkType?: "internal" | "external" }> },
  ) {
    if (siblingData.linkType === linkType && !val) {
      return "This field is required";
    }
    return true;
  };
}

export default NavBar;
