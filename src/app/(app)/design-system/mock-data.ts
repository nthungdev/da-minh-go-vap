import { AppPost } from "@/definitions";

export const MOCK_THUMBNAIL_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0e5b6b"/>
          <stop offset="100%" stop-color="#2f689d"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#g)"/>
      <circle cx="640" cy="110" r="70" fill="#fed9b7" fill-opacity="0.25"/>
      <text x="400" y="235" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="600">Hội dòng Đa Minh Gò Vấp</text>
    </svg>`,
  );

export const MOCK_POSTS: AppPost[] = [
  {
    id: "mock-post-1",
    title: "Thánh lễ Tạ ơn Khánh thành Nhà Nguyện mới tại Tu viện Gò Vấp",
    slug: "thanh-le-ta-on-khanh-thanh-nha-nguyen-moi",
    publishedAt: new Date("2026-10-15T08:00:00Z"),
    thumbnail: {
      id: "mock-media-1",
      url: "/og.png",
      alt: "Nhà nguyện mới",
      width: 1200,
      height: 630,
      updatedAt: "2026-10-15T08:00:00Z",
      createdAt: "2026-10-15T08:00:00Z",
    },
    content: [],
    tags: [],
    hiddenTags: [],
    postType: "news",
    updatedAt: "2026-10-15T08:00:00Z",
    createdAt: "2026-10-15T08:00:00Z",
  } as unknown as AppPost,
  {
    id: "mock-post-2",
    title: "Suy niệm Tin Mừng Chúa Nhật XXIX Thường Niên: Cầu nguyện luôn",
    slug: "suy-niem-tin-mung-chua-nhat-xxix",
    publishedAt: new Date("2026-10-12T06:00:00Z"),
    thumbnail: {
      id: "mock-media-2",
      url: MOCK_THUMBNAIL_SVG,
      alt: "Suy niệm Tin Mừng",
      width: 800,
      height: 450,
      updatedAt: "2026-10-12T06:00:00Z",
      createdAt: "2026-10-12T06:00:00Z",
    },
    content: [],
    tags: [],
    hiddenTags: [],
    postType: "gospel",
    updatedAt: "2026-10-12T06:00:00Z",
    createdAt: "2026-10-12T06:00:00Z",
  } as unknown as AppPost,
  {
    id: "mock-post-3",
    title: "Chương trình Tĩnh tâm Mùa Vọng 2026 dành cho Giới trẻ",
    slug: "chuong-trinh-tinh-tam-mua-vong-2026",
    publishedAt: new Date("2026-10-08T09:00:00Z"),
    thumbnail: {
      id: "mock-media-3",
      url: MOCK_THUMBNAIL_SVG,
      alt: "Tĩnh tâm Mùa Vọng",
      width: 800,
      height: 450,
      updatedAt: "2026-10-08T09:00:00Z",
      createdAt: "2026-10-08T09:00:00Z",
    },
    content: [],
    tags: [],
    hiddenTags: [],
    postType: "news",
    updatedAt: "2026-10-08T09:00:00Z",
    createdAt: "2026-10-08T09:00:00Z",
  } as unknown as AppPost,
  {
    id: "mock-post-4",
    title: "Tìm hiểu Linh đạo Đa Minh: Chiêm niệm và Trao truyền",
    slug: "tim-hieu-linh-dao-da-minh",
    publishedAt: new Date("2026-10-01T07:30:00Z"),
    thumbnail: {
      id: "mock-media-4",
      url: "/og.png",
      alt: "Linh đạo Đa Minh",
      width: 1200,
      height: 630,
      updatedAt: "2026-10-01T07:30:00Z",
      createdAt: "2026-10-01T07:30:00Z",
    },
    content: [],
    tags: [],
    hiddenTags: [],
    postType: "news",
    updatedAt: "2026-10-01T07:30:00Z",
    createdAt: "2026-10-01T07:30:00Z",
  } as unknown as AppPost,
];

export const MOCK_TIMELINE_CARDS = [
  {
    title: "1968 — Thành lập Cộng đoàn",
    description:
      "Những bước chân đầu tiên của quý Cha, quý Thầy Đa Minh tại vùng đất Gò Vấp.",
    thumbnail: {
      id: "mock-timeline-1",
      url: "/og.png",
      alt: "Thành lập Cộng đoàn",
      width: 1200,
      height: 630,
      updatedAt: "2026-10-01T00:00:00Z",
      createdAt: "2026-10-01T00:00:00Z",
    },
  },
  {
    title: "1995 — Xây dựng Tu viện & Học viện",
    description:
      "Mở rộng cơ sở đào tạo Triết học và Thần học cho các thế hệ tu sĩ trẻ.",
    thumbnail: {
      id: "mock-timeline-2",
      url: MOCK_THUMBNAIL_SVG,
      alt: "Xây dựng Tu viện",
      width: 800,
      height: 450,
      updatedAt: "2026-10-01T00:00:00Z",
      createdAt: "2026-10-01T00:00:00Z",
    },
  },
  {
    title: "2026 — Sứ vụ Truyền giáo & Mục vụ",
    description:
      "Tiếp tục đồng hành với giáo dân qua các hoạt động bác ái, giáo lý và truyền thông.",
    thumbnail: {
      id: "mock-timeline-3",
      url: "/og.png",
      alt: "Sứ vụ Truyền giáo",
      width: 1200,
      height: 630,
      updatedAt: "2026-10-01T00:00:00Z",
      createdAt: "2026-10-01T00:00:00Z",
    },
  },
];
