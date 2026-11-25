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
      className={cn(
        "rounded-lg bg-primary px-4 py-2.5 text-center font-semibold break-words text-primary-foreground shadow-xs",
        className,
      )}
      {...props}
    >
      {children}
    </HeadingTag>
  );
}
