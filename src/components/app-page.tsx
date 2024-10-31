'use client'

import classNames from 'classnames'
import { usePathname } from 'next/navigation'

interface AppPageProps {
  className?: string
  children: React.ReactNode
}

export default function AppPage({
  children,
  className,
  ...props
}: AppPageProps) {
  const pathname = usePathname()

  return (
    <main
      className={classNames(
        'w-full py-8 px-4 mx-auto max-w-screen-xl',
        {
          'pt-16': pathname !== '/',
        },
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}
