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
import { useLocale } from "next-intl";
import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import KeywordTooltip from "@/components/keyword-tooltip";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { preserveMarkdownWhitespace } from "@/utils/markdown-whitespace";

export { preserveMarkdownWhitespace };

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

function pickStringProp(
  props: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const val = props[key];
    if (typeof val === "string") return val;
  }
  return "";
}

function createMarkdownComponents(footnoteHeading: string): Components {
  return {
    // `node` is the hast element; omit it so it is not serialized into the page payload.
    img({
      node: _node,
      src,
      alt,
      width,
      height,
      loading,
      decoding,
      ...imgProps
    }) {
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
    i({ node: _node, className, children, ...iconProps }) {
      if (typeof className === "string" && className.includes("fa-")) {
        const tokens = className.split(/\s+/);
        const matchedKey = tokens.find((token) => token in FA_ICON_MAP);
        const IconComponent = matchedKey ? FA_ICON_MAP[matchedKey] : CircleDot;
        if (IconComponent) {
          return (
            <i
              {...iconProps}
              className={cn(
                "inline-flex items-center justify-center",
                className,
              )}
              aria-hidden="true"
            >
              <IconComponent
                aria-hidden="true"
                className="inline-block size-[1em]"
              />
            </i>
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
      const title = pickStringProp(props, "data-title", "title");
      const description = pickStringProp(
        props,
        "data-description",
        "description",
      );
      const imageUrl = pickStringProp(
        props,
        "data-image",
        "image",
        "data-image-url",
      );
      const href = pickStringProp(props, "data-href", "href");

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
    h2({ node: _node, id, className, children, ...h2Props }) {
      if (id === "footnote-label" || id === "user-content-footnote-label") {
        const visibleClass =
          typeof className === "string"
            ? className.replace(/\bsr-only\b/g, "").trim()
            : undefined;
        return (
          <h2
            id={id}
            className={cn(
              "mb-3 text-base tracking-tight text-gray-900",
              visibleClass,
            )}
            {...h2Props}
          >
            {footnoteHeading}
          </h2>
        );
      }
      return (
        <h2 id={id} className={className} {...h2Props}>
          {children}
        </h2>
      );
    },
  };
}

interface AppMarkdownProps {
  className?: string;
  children: string | null | undefined;
  locale?: string;
}

function AppMarkdownContent({
  children,
  className,
  resolvedLocale,
  ...props
}: Omit<AppMarkdownProps, "locale"> & { resolvedLocale: string }) {
  const footnoteHeading = resolvedLocale === "en" ? "Footnotes" : "Chú thích";
  const components = createMarkdownComponents(footnoteHeading);
  const content =
    typeof children === "string"
      ? preserveMarkdownWhitespace(children)
      : children;

  return (
    <div className={cn("markdown", className)}>
      <Markdown
        {...props}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}

function AppMarkdownWithLocale(props: Omit<AppMarkdownProps, "locale">) {
  const activeLocale = useLocale();
  return <AppMarkdownContent {...props} resolvedLocale={activeLocale} />;
}

export default function AppMarkdown({ locale, ...props }: AppMarkdownProps) {
  if (locale) {
    return <AppMarkdownContent {...props} resolvedLocale={locale} />;
  }
  return <AppMarkdownWithLocale {...props} />;
}
