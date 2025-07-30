import { twMerge } from "tailwind-merge";

interface AppGridHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

export default function AppGridHeader({
  text,
  className,
  ...props
}: AppGridHeaderProps) {
  return (
    <div
      className={twMerge(
        "@container flex flex-row items-center gap-x-1.5",
        className,
      )}
      {...props}
    >
      <div className="bg-primary-800 h-[2px] flex-1"></div>
      <span className="text-primary-800 font-header text-base font-bold uppercase @md:text-2xl">
        {text}
      </span>
      <div className="bg-primary-800 h-[2px] flex-1"></div>
    </div>
  );
}
