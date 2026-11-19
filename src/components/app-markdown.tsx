import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import KeywordTooltip from "@/components/keyword-tooltip";
import {
  BookOpen,
  Church,
  CircleDot,
  Feather,
  Globe,
  HandHeart,
  HeartHandshake,
  Languages,
  LucideIcon,
  Mic,
  Users,
  Video,
} from "lucide-react";
import Markdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "keyword"],
  attributes: {
    ...defaultSchema.attributes,
    i: [...(defaultSchema.attributes?.i ?? []), "className"],
    keyword: [
      "dataTitle",
      "dataDescription",
      "dataImage",
      "dataImageUrl",
      "dataHref",
      "title",
      "description",
      "image",
      "href",
    ],
  },
};

const FA_ICON_MAP: Record<string, LucideIcon> = {
  "fa-earth-asia": Globe,
  "fa-book-open": BookOpen,
  "fa-church": Church,
  "fa-hand-holding-heart": HeartHandshake,
  "fa-hands-praying": HandHeart,
  "fa-people-group": Users,
  "fa-feather-pointed": Feather,
  "fa-language": Languages,
  "fa-microphone": Mic,
  "fa-video": Video,
};

const markdownComponents: Components = {
  // `node` is the hast element; omit it so it is not serialized into the page payload.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  img({ node, src, alt, width, height, loading, decoding, ...imgProps }) {
    const resolvedSrc =
      typeof src === "string" && src.includes("/api/media/file/")
        ? transformUrl(src, { width: "800", quality: "80" })
        : src;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...imgProps}
        src={resolvedSrc}
        alt={alt ?? ""}
        width={width ?? 800}
        height={height ?? 450}
        loading={loading ?? "lazy"}
        decoding={decoding ?? "async"}
      />
    );
  },
  link({ href, ...linkProps }) {
    if (typeof href === "string" && href.includes("font-awesome")) {
      return null;
    }
    return <link href={href} {...linkProps} />;
  },
  i({ className, children, ...iconProps }) {
    if (typeof className === "string" && className.includes("fa-")) {
      const tokens = className.split(/\s+/);
      const matchedKey = tokens.find((token) => token in FA_ICON_MAP);
      const IconComponent = matchedKey ? FA_ICON_MAP[matchedKey] : CircleDot;
      if (IconComponent) {
        return (
          <IconComponent
            aria-hidden="true"
            className="inline-block size-[1em] align-[-0.125em]"
          />
        );
      }
    }
    return (
      <i className={className} {...iconProps}>
        {children}
      </i>
    );
  },
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
};

interface AppMarkdownProps {
  className?: string;
  children: string | null | undefined;
}

function convertLeadingSpacesToNbsp(spaces: string): string {
  return spaces
    .replace(/ /g, "\u00A0")
    .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0");
}

function isListItemLine(text: string): boolean {
  return /^[-*+]\s+/.test(text) || /^\d+[.)]\s+/.test(text);
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
  let activeFence: { char: string; length: number } | null = null;
  let inListContext = false;

  const processedLines = lines.map((line) => {
    const trimmed = line.trimStart();

    if (activeFence) {
      const closeMatch = trimmed.match(/^(`{3,}|~{3,})[ \t]*$/);
      const closeMarker = closeMatch?.[1];
      if (
        closeMarker &&
        closeMarker[0] === activeFence.char &&
        closeMarker.length >= activeFence.length
      ) {
        activeFence = null;
      }
      return line;
    }

    const openMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    const openMarker = openMatch?.[1];
    const openInfo = openMatch?.[2] ?? "";
    if (openMarker && (openMarker[0] === "~" || !openInfo.includes("`"))) {
      activeFence = {
        char: openMarker[0] ?? "`",
        length: openMarker.length,
      };
      return line;
    }

    // Do not transform empty or whitespace-only lines; reset list context so
    // an indented paragraph after a blank line still preserves its indentation.
    if (!line.trim()) {
      inListContext = false;
      return line;
    }

    // Check for blockquote prefix (e.g. "> " or ">> "), consuming at most one space per marker
    // so additional leading indentation in `rest` is preserved.
    const blockquoteMatch = line.match(/^(\s*(?:> ?)+)(.*)$/);
    if (blockquoteMatch) {
      inListContext = false;
      const prefix = blockquoteMatch[1] ?? "";
      const rest = blockquoteMatch[2] ?? "";
      const leadingSpacesMatch = rest.match(/^([ \t]+)(.*)$/);
      if (leadingSpacesMatch) {
        const spaces = leadingSpacesMatch[1] ?? "";
        const tail = leadingSpacesMatch[2] ?? "";
        return `${prefix}${convertLeadingSpacesToNbsp(spaces)}${tail}`;
      }
      return line;
    }

    // Check for leading spaces/tabs on regular lines
    const leadingSpacesMatch = line.match(/^([ \t]+)(.*)$/);
    if (leadingSpacesMatch) {
      const spaces = leadingSpacesMatch[1] ?? "";
      const rest = leadingSpacesMatch[2] ?? "";

      // Keep standard markdown list indentation and list item continuations intact
      if (isListItemLine(rest)) {
        inListContext = true;
        return line;
      }

      if (inListContext) {
        return line;
      }

      return `${convertLeadingSpacesToNbsp(spaces)}${rest}`;
    }

    inListContext = isListItemLine(line);
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
    typeof children === "string"
      ? preserveMarkdownWhitespace(children)
      : children;

  return (
    <div className={cn("markdown", className)}>
      <Markdown
        {...props}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </div>
  );
}
