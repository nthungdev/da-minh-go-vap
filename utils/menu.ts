import { normalizeText } from "normalize-text";

const menu = [
  { href: '/', name: 'Trang chủ' },
  {
    href: '/congregation',
    name: 'Hội dòng',
    children: [
      { href: '/introduction', name: 'Giới thiệu' },
      { href: '/history', name: 'Lịch sử' },
      { href: '/establishment', name: 'Sắc lập dòng' },
      { href: '/authorities', name: 'Các Đấng bản quyền' },
    ],
  },
  {
    href: '/spirituality',
    name: 'Linh đạo',
    children: [
      { href: '/charism', name: 'Tinh thần dòng' },
      { href: '/saint-dominic', name: 'Thánh Đa Minh' },
      { href: '/saints', name: 'Các Thánh dòng' },
    ],
  },
  {
    href: '/missions',
    name: 'Sứ vụ',
    children: [
      { href: '/evangelization', name: 'Truyền giáo' },
      { href: '/pastoral-care', name: 'Mục vụ' },
      { href: '/social-activities', name: 'Hoạt động bác ái xã hội' },
      { href: '/education', name: 'Giáo dục' },
    ]
  },
  { href: '/prayer', name: 'Cầu nguyện' },
  { href: '/ongoi', name: 'Ơn gọi' },
  { href: '/news', name: 'Bản tin' },
  { href: '/topics', name: 'Chuyên đề' },
  { href: '/contact', name: 'Liên hệ' },
].map((link) => ({
  ...link,
  normalizedName: normalizeText(link.href),
  children: link.children?.map((child) => ({
    ...child,
    normalizedName: normalizeText(child.href),
  })),
}))

export default menu