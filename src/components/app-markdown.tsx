import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/common";

interface AppMarkdownProps {
  className?: string;
  children: string | null | undefined;
}

/**
 * Preprocesses markdown text to preserve intentional leading indentation spaces
 * and whitespace in paragraphs without triggering CommonMark indented code blocks.
 *
 * In standard CommonMark, lines with 4 spaces or tabs become code blocks,
 * and 1-3 spaces at the start of a paragraph are stripped. Converting leading
 * indentation on non-list lines to non-breaking spaces preserves visual formatting
 * while maintaining normal text semantics.
 *
 * @param content - Raw markdown text input
 * @returns Preprocessed markdown with preserved paragraph indentation
 */
export function preserveMarkdownWhitespace(content: string): string {
  if (!content) return content;

  const lines = content.split("\n");
  let inFencedCodeBlock = false;

  const processedLines = lines.map((line) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFencedCodeBlock = !inFencedCodeBlock;
      return line;
    }

    if (inFencedCodeBlock) {
      return line;
    }

    // Do not transform empty or whitespace-only lines
    if (!line.trim()) {
      return line;
    }

    // Check for blockquote prefix (e.g. "> " or ">> ")
    const blockquoteMatch = line.match(/^(\s*>+\s*)(.*)$/);
    if (blockquoteMatch) {
      const prefix = blockquoteMatch[1];
      const rest = blockquoteMatch[2];
      const leadingSpacesMatch = rest.match(/^([ \t]+)(.*)$/);
      if (leadingSpacesMatch) {
        const converted = leadingSpacesMatch[1]
          .replace(/ /g, "\u00A0")
          .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0");
        return `${prefix}${converted}${leadingSpacesMatch[2]}`;
      }
      return line;
    }

    // Check for leading spaces/tabs on regular lines
    const leadingSpacesMatch = line.match(/^([ \t]+)(.*)$/);
    if (leadingSpacesMatch) {
      const spaces = leadingSpacesMatch[1];
      const rest = leadingSpacesMatch[2];

      // Keep standard markdown list indentation intact
      if (/^[-*+]\s+/.test(rest) || /^\d+\.\s+/.test(rest)) {
        return line;
      }

      // Convert leading spaces to non-breaking spaces
      const convertedSpaces = spaces
        .replace(/ /g, "\u00A0")
        .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0");
      return `${convertedSpaces}${rest}`;
    }

    return line;
  });

  return processedLines.join("\n");
}

export default function AppMarkdown({
  children,
  className,
  ...props
}: AppMarkdownProps) {
  const content =
    typeof children === "string" ? preserveMarkdownWhitespace(children) : children;

  return (
    <div className={cn("markdown", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        {...props}
      >
        {content}
      </Markdown>
    </div>
  );
}
