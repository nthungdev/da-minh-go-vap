import { normalizeText } from 'normalize-text'
import config from '@payload-config'
import { getPayload } from 'payload'
import { NavBar } from '@/payload-types'

export interface MenuItem {
  href: string
  absoluteHref: string
  name: string
  normalizedName: string
  children?: MenuItem[]
}

function getMenuItemLink(menuItem: NavBar['menu'][number]) {
  if (menuItem.linkType === 'internal') {
    if (typeof menuItem.internalLink !== 'string') {
      return menuItem.internalLink?.path
    } else {
      return undefined
    }
  } else {
    return menuItem.externalLink
  }
}

export async function getMenu() {
  const payload = await getPayload({ config })
  const navBar = await payload.findGlobal({ slug: 'navBar' })
  const menu: MenuItem[] = navBar.menu.map((menuItem) => ({
    href: getMenuItemLink(menuItem) || '',
    absoluteHref: getMenuItemLink(menuItem) || '',
    name: menuItem.label,
    normalizedName: normalizeText(menuItem.label),
    children: menuItem.subMenu?.map((subMenuItem) => ({
      href: getMenuItemLink(subMenuItem) || '',
      absoluteHref: getMenuItemLink(subMenuItem) || '',
      name: subMenuItem.label,
      normalizedName: normalizeText(subMenuItem.label),
      children: subMenuItem.subMenu?.map((subSubMenuItem) => ({
        href: getMenuItemLink(subSubMenuItem) || '',
        absoluteHref: getMenuItemLink(subSubMenuItem) || '',
        name: subSubMenuItem.label,
        normalizedName: normalizeText(subSubMenuItem.label),
      })),
    })),
  }))
  return menu
}

// const menu: MenuItem[] = [
//   { href: '/', name: 'Trang chủ' },
//   {
//     href: '/congregation',
//     name: 'Hội dòng',
//     children: [
//       { href: '/introduction', name: 'Giới thiệu' },
//       { href: '/history', name: 'Lịch sử' },
//       { href: '/gratitude', name: 'Tri ân' },
//     ],
//   },
//   {
//     href: '/spirituality',
//     name: 'Linh đạo',
//     children: [
//       { href: '/charism', name: 'Tinh thần dòng' },
//       { href: '/saint-dominic', name: 'Thánh Đa Minh' },
//       { href: '/saints', name: 'Các Thánh dòng' },
//     ],
//   },
//   {
//     href: '/missions',
//     name: 'Sứ vụ',
//     children: [
//       { href: '/evangelization', name: 'Truyền giáo' },
//       { href: '/pastoral-care', name: 'Mục vụ' },
//       { href: '/social-activities', name: 'Hoạt động bác ái xã hội' },
//       { href: '/education', name: 'Giáo dục' },
//     ],
//   },
//   {
//     href: '/prayer',
//     name: 'Cầu nguyện',
//     children: [
//       { href: '/meditation', name: 'Suy niệm' },
//       { href: '/intention', name: 'Ý nguyện' },
//       { href: '/liturgy', name: 'Nguyện Kinh phụng vụ' },
//     ],
//   },
//   {
//     href: '/vocation',
//     name: 'Ơn gọi',
//     children: [
//       { href: '/introduction', name: 'Giới thiệu' },
//       { href: '/stories', name: 'Chuyện giờ mới kể' },
//     ],
//   },
//   {
//     href: '/news',
//     name: 'Bản tin',
//     children: [
//       { href: '/church', name: 'Bản tin Giáo Hội' },
//       { href: '/dominican-family', name: 'Bản tin Gia đình Đa Minh' },
//       {
//         href: '/congregation',
//         name: 'Bản tin Hội dòng',
//         children: [
//           { href: '/information', name: 'Thông tin' },
//           { href: '/obituary', name: 'Cáo phó' },
//           { href: '/profession', name: 'Lễ khấn' },
//           { href: '/internal', name: 'Tin nội bộ' },
//         ],
//       },
//     ],
//   },
//   {
//     href: '/topics',
//     name: 'Chuyên đề',
//     children: (topicsAttributes as PageTopics).sections.map(({ title }) => ({
//       href: `/${normalizeText(title).replaceAll(/\s+/g, '-').toLowerCase()}`,
//       name: title,
//     })),
//   },
//   {
//     href: '/culture',
//     name: 'Văn hóa',
//     children: (cultureAttributes as PageCulture).sections.map(({ title }) => ({
//       href: `/${normalizeText(title).replaceAll(/\s+/g, '-').toLowerCase()}`,
//       name: title,
//     })),
//   },
//   {
//     href: '/materials',
//     name: 'Tài liệu',
//     children: (materialsAttributes as PageMaterials).sections.map(
//       ({ title }) => ({
//         href: `/${normalizeText(title).replaceAll(/\s+/g, '-').toLowerCase()}`,
//         name: title,
//       })
//     ),
//   },
//   { href: '/contact', name: 'Liên hệ' },
// ].map((link) => ({
//   ...link,
//   normalizedName: normalizeText(link.href),
//   absoluteHref: link.href,
//   children: link.children?.map((child) => ({
//     ...child,
//     normalizedName: normalizeText(child.href),
//     absoluteHref: `${link.href}${child.href}`,
//     children: child.children?.map((grandChild) => ({
//       ...grandChild,
//       normalizedName: normalizeText(grandChild.href),
//       absoluteHref: `${link.href}${child.href}${grandChild.href}`,
//     })),
//   })),
// }))

// export default menu
