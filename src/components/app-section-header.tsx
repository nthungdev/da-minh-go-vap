interface AppSectionHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export default function AppSectionHeader({
  children,
  className,
  ...props
}: AppSectionHeaderProps) {
  return (
    <div
      {...props}
      className={`bg-primary-800 p-2.5 text-center text-gray-50 ${className}`}
    >
      {children}
    </div>
  );
}
