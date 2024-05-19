import Link from "next/link";

export default function NavBar() {
  const links = [
    { href: '/', name: 'Hoi Dong' },
    { href: '/hoidong', name: 'Hoi Dong' },
    { href: '/linhdao', name: 'Linh Dao' },
    { href: '/suvu', name: 'Su Vu' },
    { href: '/caunguyen', name: 'Cau Nguyen' },
    { href: '/ongoi', name: 'On Goi' },
    { href: '/bantin', name: 'Ban Tin' },
    { href: '/chuyende', name: 'Chuyen De' },
    { href: '/lienhe', name: 'Lien He' },
  ]

  return (
    <nav>
      {links.map(link => (
        <Link className="px-2" key={link.href} href={link.href}>{link.name}</Link>
      ))}
    </nav>
  )
}