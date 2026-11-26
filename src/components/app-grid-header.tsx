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
      className={cn("@container flex flex-row items-center gap-x-3", className)}
      {...props}
    >
      <div aria-hidden="true" className="h-[2px] flex-1 bg-primary" />
      <HeadingTag className="text-center text-base font-bold text-primary uppercase @md:text-2xl">
        {text}
      </HeadingTag>
      <div aria-hidden="true" className="h-[2px] flex-1 bg-primary" />
    </div>
  );
}
