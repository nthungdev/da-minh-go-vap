import { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";

const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  label: "Cấu hình website",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Nội Dung",
          fields: [
            {
              type: "upload",
              name: "logo",
              relationTo: "media",
            },
            {
              type: "text",
              name: "siteName",
              label: "Tên website",
              localized: true,
              admin: {
                description:
                  "Tên hiển thị trên tiêu đề của trình duyệt và trang web",
              },
            },
            {
              type: "text",
              name: "organizationName",
              label: "Tên hội dòng / tổ chức",
              localized: true,
              admin: {
                description: "Tên hiển thị trong phần chân trang (footer)",
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
