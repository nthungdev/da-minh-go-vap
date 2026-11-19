import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
import { preserveMarkdownWhitespace } from "@/utils/markdown-whitespace";
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
import { useLocale } from "next-intl";
import Markdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export { preserveMarkdownWhitespace };

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...new Set([
      ...(defaultSchema.tagNames ?? []),
      "keyword",
      "section",
      "sup",
      "ol",
      "li",
      "a",
      "h2",
    ]),
  ],
  attributes: {
    ...defaultSchema.attributes,
    i: [...(defaultSchema.attributes?.i ?? []), "className"],
    section: [
      ...(defaultSchema.attributes?.section ?? []),
      "dataFootnotes",
      "className",
    ],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id", "className"],
    ol: [...(defaultSchema.attributes?.ol ?? []), "className"],
    li: [...(defaultSchema.attributes?.li ?? []), "id", "className"],
    sup: [...(defaultSchema.attributes?.sup ?? []), "className"],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "href",
      "id",
      "className",
      "dataFootnoteRef",
      "dataFootnoteBackref",
      "ariaDescribedBy",
      "ariaLabel",
    ],
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

function createMarkdownComponents(footnoteHeading: string): Components {
  return {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    h2({ node, id, className, children, ...h2Props }) {
      if (id === "footnote-label" || id === "user-content-footnote-label") {
        const visibleClass =
          typeof className === "string"
            ? className.replace(/\bsr-only\b/g, "").trim()
            : undefined;
        return (
          <h2
            id={id}
            className={cn(
              "mb-3 text-base font-semibold tracking-tight text-gray-900",
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

export default function AppMarkdown({
  children,
  className,
  locale,
  ...props
}: AppMarkdownProps) {
  const activeLocale = useLocale();
  const resolvedLocale = locale ?? activeLocale;
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
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
