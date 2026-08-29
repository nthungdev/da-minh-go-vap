export const MENU_ICON_OPTIONS = [
  { label: "Trang chủ", value: "home" },
  { label: "Âm nhạc", value: "am-nhac" },
  { label: "Đào tạo", value: "dao-tao" },
  { label: "Dịch thuật", value: "dich-thuat" },
  { label: "Học hỏi", value: "hoc-hoi" },
  { label: "Hội họa", value: "hoi-hoa" },
  { label: "Khấn dòng", value: "khan-dong" },
  { label: "Lịch sử", value: "lich-su" },
  { label: "Liên hệ", value: "lien-he" },
  { label: "Bưu thiếp", value: "postcard" },
  { label: "Tài liệu", value: "tai-lieu" },
  { label: "Tinh thần dòng", value: "tinh-than-dong" },
  { label: "Tri ân", value: "tri-an" },
  { label: "Tưởng nhớ", value: "tuong-nho" },
  { label: "Video", value: "video" },
] as const;

export type MenuIconName = (typeof MENU_ICON_OPTIONS)[number]["value"];

export function getMenuIconSrc(iconName?: string | null): string | null {
  if (!iconName) return null;
  return `/svgs/menu-icons/${iconName}.svg`;
}
