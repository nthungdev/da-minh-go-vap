import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

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
    <Markdown
      className={`markdown ${className}`}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      {...props}
    >
      {children}
    </Markdown>
  );
}
