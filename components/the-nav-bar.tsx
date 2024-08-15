import Link from 'next/link'
import { attributes } from '@/content/settings/site.md'
import Image from 'next/image'

interface TheNavBarProps {
  className?: string
}

export default function TheNavBar({ className }: TheNavBarProps) {
  const links = [
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
    { href: '/mission', name: 'Sứ vụ' },
    { href: '/prayer', name: 'Cầu nguyện' },
    { href: '/ongoi', name: 'Ơn gọi' },
    { href: '/news', name: 'Bản tin' },
    { href: '/topics', name: 'Chuyên đề' },
    { href: '/contact', name: 'Liên hệ' },
  ]

  const { logo } = attributes

  return (
    <nav
      className={`relative bg-primary text-gray-50 py-2 flex flex-row flex-wrap justify-center ${className}`}
    >
      <ul className="flex flex-row flex-wrap items-center max-w-screen-xl">
        <div className="relative overflow-auto h-16 w-16">
          <Image
            src={logo}
            alt="logo"
            quality={100}
            sizes="100%"
            fill
            priority
          />
        </div>

        {links.map((link) => (
          <li key={link.href} className="relative flex flex-row">
            <Link className="block peer px-3 py-2" href={link.href}>
              {link.name.toUpperCase()}
            </Link>

            {link.children && (
              <div className="z-20 hidden peer-hover:block hover:block absolute top-full left-0">
                <ul className="mt-4 bg-primary-400">
                  {link.children.map((child) => (
                    <li key={child.href} className="block">
                      <Link
                        href={`${link.href}${child.href}`}
                        className="block text-nowrap px-4 py-2 hover:bg-primary-700 hover:text-gray-50"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
