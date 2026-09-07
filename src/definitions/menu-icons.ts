export const MENU_ICON_OPTIONS = [
  { label: "Trang chủ", value: "home" },
  { label: "Đào tạo / Điều hành", value: "team-gear" },
  { label: "Lịch sử", value: "parchment-quill" },
  { label: "Tri ân / Gia đình", value: "family-heart" },
  { label: "Bác ái", value: "hands-heart" },
  { label: "Liên hệ", value: "location-pin" },
  { label: "Tưởng nhớ / Ngọn nến", value: "burning-candle" },
  { label: "Thánh Đa Minh", value: "saint-dominic" },
  { label: "Dịch thuật / Song ngữ", value: "translation-book" },
  { label: "Hội họa", value: "palette-brush" },
  { label: "Video", value: "video-play" },
  { label: "Học hỏi", value: "person-laptop-idea" },
  { label: "Podcast", value: "microphone-soundwave" },
  { label: "Âm nhạc", value: "music-notes" },
  { label: "Tài liệu", value: "documents-stack" },
  { label: "Bản tin / Hoàn vũ", value: "globe" },
  { label: "Cầu nguyện", value: "praying-hands" },
  { label: "Sứ vụ / Bông lúa", value: "wheat-stalks" },
  { label: "Tin Giáo hội / Vatican", value: "st-peters-basilica" },
  { label: "Chút men cho đời", value: "hand-sprinkling-salt" },
  { label: "Ngôi sao Đa Minh", value: "radiant-star" },
  { label: "Kinh Thánh suy niệm", value: "open-bible-cross" },
  { label: "Truyền thông", value: "person-broadcast" },
  { label: "Triết học / Trí tuệ", value: "human-brain" },
  { label: "Giáo dục trực tuyến", value: "laptop-book" },
  { label: "Huy hiệu Dòng Đa Minh", value: "dominican-shield" },
  { label: "Ơn gọi", value: "user-growth" },
  { label: "Đuốc Đa Minh", value: "dominican-dog-torch" },
  { label: "Chuyên đề / Kế hoạch", value: "checklist" },
  { label: "Giáo dục / Tri thức", value: "book-lightbulb" },
  { label: "Đọc sách / Bản tin", value: "book-reading" },
  { label: "Đời tu / Khấn dòng", value: "heart-jhs-rosary" },
  { label: "Thần học / Phụng vụ", value: "cross-book" },
  { label: "Đường phân cách", value: "divider-line" },
] as const;

export type MenuIconName = (typeof MENU_ICON_OPTIONS)[number]["value"];

export function getMenuIconSrc(iconName?: string | null): string | null {
  if (!iconName) return null;
  return `/svgs/menu-icons/${iconName}.svg`;
}
