export const MENU_ICON_OPTIONS = [
  { label: "Trang chủ", value: "home" },
  { label: "Ngọn nến", value: "burning-candle" },
  { label: "Tài liệu", value: "documents-stack" },
  { label: "Đuốc Đa Minh", value: "dominican-dog-torch" },
  { label: "Gia đình", value: "family-heart" },
  { label: "Bác ái", value: "hands-heart" },
  { label: "Liên hệ", value: "location-pin" },
  { label: "Podcast", value: "microphone-soundwave" },
  { label: "Âm nhạc", value: "music-notes" },
  { label: "Hội họa", value: "palette-brush" },
  { label: "Lịch sử", value: "parchment-quill" },
  { label: "Học hỏi", value: "person-laptop-idea" },
  { label: "Thánh Đa Minh", value: "saint-dominic" },
  { label: "Đào tạo", value: "team-gear" },
  { label: "Dịch thuật", value: "translation-book" },
  { label: "Ơn gọi", value: "user-growth" },
  { label: "Video", value: "video-play" },
] as const;

export type MenuIconName = (typeof MENU_ICON_OPTIONS)[number]["value"];

export function getMenuIconSrc(iconName?: string | null): string | null {
  if (!iconName) return null;
  return `/svgs/menu-icons/${iconName}.svg`;
}
