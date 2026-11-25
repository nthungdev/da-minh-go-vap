import { cn } from "@/utils/common";

interface AppGridHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  as?: "h1" | "h2" | "h3";
}

export default function AppGridHeader({
  text,
  as: HeadingTag = "h2",
  className,
  ...props
}: AppGridHeaderProps) {
  return (
    <div
      className={cn(
        "@container flex flex-row items-center gap-x-1.5",
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className="h-[2px] flex-1 bg-primary-800" />
      <HeadingTag className="text-base font-bold text-primary-800 uppercase @md:text-2xl">
        {text}
      </HeadingTag>
      <div aria-hidden="true" className="h-[2px] flex-1 bg-primary-800" />
    </div>
  );
}
