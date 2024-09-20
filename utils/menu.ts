import { normalizeText } from 'normalize-text'
import { attributes as topicsAttributes } from '@/content/pages/topics/index.md'
import { attributes as cultureAttributes } from '@/content/pages/culture/index.md'

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
    ],
  },
  {
    href: '/prayer',
    name: 'Cầu nguyện',
    children: [
      { href: '/meditation', name: 'Suy niệm' },
      { href: '/intention', name: 'Ý nguyện' },
      { href: '/liturgy', name: 'Nguyện Kinh phụng vụ' },
    ],
  },
  {
    href: '/vocation',
    name: 'Ơn gọi',
    children: [
      { href: '/introduction', name: 'Giới thiệu' },
      { href: '/stories', name: 'Chuyện giờ mới kể' },
    ],
  },
  {
    href: '/news',
    name: 'Bản tin',
    children: [
      { href: '/church', name: 'Bản tin Giáo Hội' },
      { href: '/dominican-family', name: 'Bản tin Gia đình Đa Minh' },
      { href: '/congregation', name: 'Bản tin Hội dòng' },
    ],
  },
  {
    href: '/topics',
    name: 'Chuyên đề',
    children: (topicsAttributes as PageTopics).sections.map(({ title }) => ({
      href: `/${normalizeText(title).replaceAll(/\s+/g, '-').toLowerCase()}`,
      name: title,
    })),
  },
  {
    href: '/culture',
    name: 'Văn hóa',
    children: (cultureAttributes as PageCulture).sections.map(({ title }) => ({
      href: `/${normalizeText(title).replaceAll(/\s+/g, '-').toLowerCase()}`,
      name: title,
    })),
  },
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
