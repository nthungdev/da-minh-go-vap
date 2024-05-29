import Link from "next/link";

export default function TheNavBar() {
  const links = [
    { href: '/', name: 'Trang chủ' },
    {
      href: '/congregation', name: 'Hội dòng',
      children: [
        { href: '/introduction', name: 'Giới thiệu' },
        { href: '/history', name: 'Lịch sử' },
        { href: '/establishment', name: 'Sắc lập dòng' },
        { href: '/authorities', name: 'Các Đắng bản quyền' },
      ]
    },
    { href: '/linhdao', name: 'Linh đạo' },
    { href: '/mission', name: 'Sứ vụ' },
    { href: '/prayer', name: 'Cầu nguyện' },
    { href: '/ongoi', name: 'Ơn gọi' },
    { href: '/news', name: 'Bản tin' },
    { href: '/topics', name: 'Chuyên đề' },
    { href: '/contact', name: 'Liên hệ' },
  ]

  return (
    <nav className="bg-blue-500 flex flex-row items-center">
      <div className="h-16 w-16 flex justify-center items-center">Logo</div>
      <ul className="flex flex-row">
        {links.map(link => (
          <li key={link.href} className="relative flex flex-row">
            <Link className="block peer px-4 py-2 hover:bg-blue-300" href={link.href}>
              {link.name.toUpperCase()}
            </Link>

            {link.children && (
              <div className="z-20 hidden peer-hover:block hover:block absolute top-full left-0">
                <ul className="mt-4 bg-red-400">
                  {link.children.map(child => (
                    <li key={child.href} className="block">
                      <Link href={`${link.href}${child.href}`} className="block text-nowrap px-4 py-2 hover:bg-blue-300">
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