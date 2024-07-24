interface AppPageProps {
  className?: string;
  children: React.ReactNode;
}

export default function AppPage({
  children,
  className,
  ...props
}: AppPageProps) {
  return (
    <main className={`py-8 mx-auto max-w-screen-lg ${className}`} {...props}>
      {children}
    </main>
  )
}
