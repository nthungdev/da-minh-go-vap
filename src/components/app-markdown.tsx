import {
  BookOpen,
  Church,
  CircleDot,
  Feather,
  Globe,
  HandHeart,
  HeartHandshake,
  Languages,
  type LucideIcon,
  Mic,
  Users,
  Video,
} from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import KeywordTooltip from "@/components/keyword-tooltip";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

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
  img({ node, src, alt, width, height, loading, decoding, ...imgProps }) {
    const resolvedSrc =
      typeof src === "string" && src.includes("/api/media/file/")
        ? transformUrl(src, { width: "800", quality: "80" })
        : src;

    return (
      // biome-ignore lint/performance/noImgElement: markdown renders arbitrary external image URLs
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

function getIndentWidth(spaces: string): number {
  let width = 0;
  for (const ch of spaces) {
    width += ch === "\t" ? 4 : 1;
  }
  return width;
}

function getListContentOffset(line: string): number | null {
  const match = line.match(/^([ \t]*)([-*+]|\d+[.)])([ \t]+)(.*)$/);
  if (!match) return null;
  const leading = match[1] ?? "";
  const marker = match[2] ?? "";
  const gap = match[3] ?? "";
  return getIndentWidth(leading) + marker.length + getIndentWidth(gap);
}

function isIndentedBlockSyntax(spaces: string, rest: string): boolean {
  if (getIndentWidth(spaces) > 3) return false;
  // CommonMark allows 0-3 leading spaces for ATX headings, thematic breaks, and GFM tables.
  return (
    /^#{1,6}(?:\s|$)/.test(rest) ||
    /^(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/.test(rest) ||
    rest.startsWith("|")
  );
}

interface MarkdownWhitespaceState {
  activeFence: { char: string; length: number } | null;
  listContentOffset: number | null;
  sawBlankLineInList: boolean;
}

function resetListState(state: MarkdownWhitespaceState): void {
  state.listContentOffset = null;
  state.sawBlankLineInList = false;
}

function tryCloseFence(trimmed: string, state: MarkdownWhitespaceState): void {
  if (!state.activeFence) return;
  const closeMatch = trimmed.match(/^(`{3,}|~{3,})[ \t]*$/);
  const closeMarker = closeMatch?.[1];
  if (
    closeMarker &&
    closeMarker[0] === state.activeFence.char &&
    closeMarker.length >= state.activeFence.length
  ) {
    state.activeFence = null;
  }
}

function tryOpenFence(
  line: string,
  trimmed: string,
  state: MarkdownWhitespaceState,
): boolean {
  const openMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
  const openMarker = openMatch?.[1];
  const openInfo = openMatch?.[2] ?? "";
  if (!openMarker || (openMarker[0] !== "~" && openInfo.includes("`"))) {
    return false;
  }

  const fenceIndent = getIndentWidth(
    line.slice(0, line.length - trimmed.length),
  );
  if (
    state.listContentOffset !== null &&
    fenceIndent < state.listContentOffset
  ) {
    resetListState(state);
  }
  state.activeFence = {
    char: openMarker[0] ?? "`",
    length: openMarker.length,
  };
  return true;
}

function transformBlockquoteLine(line: string): string | null {
  // Check for blockquote prefix (e.g. "> " or ">> "), consuming at most one space per marker
  // so additional leading indentation in `rest` is preserved.
  const blockquoteMatch = line.match(/^(\s*(?:> ?)+)(.*)$/);
  if (!blockquoteMatch) return null;

  const prefix = blockquoteMatch[1] ?? "";
  const rest = blockquoteMatch[2] ?? "";
  const leadingSpacesMatch = rest.match(/^([ \t]+)(.*)$/);
  if (!leadingSpacesMatch) return line;

  const spaces = leadingSpacesMatch[1] ?? "";
  const tail = leadingSpacesMatch[2] ?? "";
  return `${prefix}${convertLeadingSpacesToNbsp(spaces)}${tail}`;
}

function transformIndentedLine(
  line: string,
  state: MarkdownWhitespaceState,
): string | null {
  const leadingSpacesMatch = line.match(/^([ \t]+)(.*)$/);
  if (!leadingSpacesMatch) return null;

  const spaces = leadingSpacesMatch[1] ?? "";
  const rest = leadingSpacesMatch[2] ?? "";

  if (state.listContentOffset !== null) {
    const indentWidth = getIndentWidth(spaces);
    // Preserve tight list continuations or loose-list paragraphs within the item's
    // CommonMark continuation range [listContentOffset, listContentOffset + 4).
    const isWithinListContinuation =
      !state.sawBlankLineInList ||
      (indentWidth >= state.listContentOffset &&
        indentWidth < state.listContentOffset + 4);
    if (isWithinListContinuation) {
      state.sawBlankLineInList = false;
      return line;
    }
    resetListState(state);
  }

  if (isIndentedBlockSyntax(spaces, rest)) {
    return line;
  }

  return `${convertLeadingSpacesToNbsp(spaces)}${rest}`;
}

function processMarkdownLine(
  line: string,
  state: MarkdownWhitespaceState,
): string {
  const trimmed = line.trimStart();

  if (state.activeFence) {
    tryCloseFence(trimmed, state);
    return line;
  }

  if (tryOpenFence(line, trimmed, state)) {
    return line;
  }

  // Do not transform empty or whitespace-only lines
  if (!line.trim()) {
    if (state.listContentOffset !== null) {
      state.sawBlankLineInList = true;
    }
    return line;
  }

  const blockquoteLine = transformBlockquoteLine(line);
  if (blockquoteLine !== null) {
    resetListState(state);
    return blockquoteLine;
  }

  const itemOffset = getListContentOffset(line);
  if (itemOffset !== null) {
    state.listContentOffset = itemOffset;
    state.sawBlankLineInList = false;
    return line;
  }

  const indentedLine = transformIndentedLine(line, state);
  if (indentedLine !== null) {
    return indentedLine;
  }

  resetListState(state);
  return line;
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

  const state: MarkdownWhitespaceState = {
    activeFence: null,
    listContentOffset: null,
    sawBlankLineInList: false,
  };

  return content
    .split("\n")
    .map((line) => processMarkdownLine(line, state))
    .join("\n");
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
