import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";
import { GlobalConfig } from "payload";

const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  access: {
    read: onlyRoles(["admin", "manager"]),
    update: onlyRoles(["admin", "manager"]),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Nội Dung",
          fields: [
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "siteName",
              label: "Tên của website",
              type: "text",
              localized: true,
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
              virtual: "siteName",
              localized: true,
              access: {
                update: () => false,
              },
              admin: {
                description:
                  "Dùng chung với tên của website trong tab Nội Dung",
              },
            },
            {
              type: "text",
              name: "description",
              localized: true,
              admin: {
                description: "Mô tả ngắn về website",
              },
            },
          ],
        },
        {
          label: "Bảo Mật",
          fields: [
            {
              name: "lockSite",
              label: "Khóa toàn bộ website (HTTP Basic Auth)",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description:
                  "Khi bật, người dùng cần đăng nhập HTTP Basic Auth để truy cập toàn bộ website (trừ admin và API).",
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

export default SiteSettings;
