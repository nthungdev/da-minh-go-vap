import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/common";
import KeywordTooltip from "@/components/keyword-tooltip";

interface AppMarkdownProps {
  className?: string;
  children: string | null | undefined;
}

function renderKeywordTooltip({
  node: _node,
  children,
  ...rest
}: Record<string, any>) {
  const title = rest["data-title"] || rest.title || "";
  const description = rest["data-description"] || rest.description || "";
  const imageUrl =
    rest["data-image"] || rest.image || rest["data-image-url"] || "";
  const href = rest["data-href"] || rest.href || "";

  return (
    <KeywordTooltip
      title={title}
      description={description}
      imageUrl={imageUrl}
      href={href}
    >
      {children}
    </KeywordTooltip>
  );
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
        components={{
          // @ts-expect-error custom HTML tag for keyword tooltip cards in markdown
          keyword: renderKeywordTooltip,
        }}
        {...props}
      >
        {children}
      </Markdown>
    </div>
  );
}
