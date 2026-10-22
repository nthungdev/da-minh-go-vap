import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/common";

interface AppMarkdownProps {
  className?: string;
  children: string | null | undefined;
}

export default function AppMarkdown({
  children,
  className,
  ...props
}: AppMarkdownProps) {
  return (
    <div className={cn("markdown", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        {...props}
      >
        {children}
      </Markdown>
    </div>
  );
}
