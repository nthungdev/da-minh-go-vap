import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/common";
import KeywordTooltip from "@/components/keyword-tooltip";

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
        components={{
          // @ts-expect-error custom HTML tag for keyword tooltip cards in markdown
          keyword: (props: {
            node?: unknown;
            children?: React.ReactNode;
            [key: string]: unknown;
          }) => {
            const title =
              typeof props["data-title"] === "string"
                ? props["data-title"]
                : typeof props.title === "string"
                  ? props.title
                  : "";
            const description =
              typeof props["data-description"] === "string"
                ? props["data-description"]
                : typeof props.description === "string"
                  ? props.description
                  : "";
            const imageUrl =
              typeof props["data-image"] === "string"
                ? props["data-image"]
                : typeof props.image === "string"
                  ? props.image
                  : typeof props["data-image-url"] === "string"
                    ? props["data-image-url"]
                    : "";
            const href =
              typeof props["data-href"] === "string"
                ? props["data-href"]
                : typeof props.href === "string"
                  ? props.href
                  : "";

            return (
              <KeywordTooltip
                title={title}
                description={description}
                imageUrl={imageUrl}
                href={href}
              >
                {props.children}
              </KeywordTooltip>
            );
          },
        }}
        {...props}
      >
        {children}
      </Markdown>
    </div>
  );
}
