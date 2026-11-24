import { cn } from "@/utils/common";

interface AppSectionHeaderProps {
  as?: "h2" | "h3" | "div";
  className?: string;
  children: React.ReactNode;
}

export default function AppSectionHeader({
  as: HeadingTag = "h2",
  children,
  className,
  ...props
}: AppSectionHeaderProps) {
  return (
    <HeadingTag
      className={cn("bg-primary-800 p-2.5 text-center text-gray-50", className)}
      {...props}
    >
      {children}
    </HeadingTag>
  );
}
