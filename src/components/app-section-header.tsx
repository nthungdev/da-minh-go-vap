import { twMerge } from "tailwind-merge";

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
      className={twMerge(
        "bg-primary-800 p-2.5 text-center text-gray-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
