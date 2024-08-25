'use client'

import { usePathname } from "next/navigation";

interface AppPageProps {
  className?: string;
  children: React.ReactNode;
}

export default function AppPage({
  children,
  className,
  ...props
}: AppPageProps) {
  const pathname = usePathname()

  return (
    <main className={`w-full py-8 px-4 mx-auto max-w-screen-lg ${pathname !== '/' ? 'pt-16' : ''} ${className}`} {...props}>
      {children}
    </main>
  )
}
