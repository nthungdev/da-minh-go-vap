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

export default function AppMarkdown({
  children,
  className,
  ...props
}: AppMarkdownProps) {
  return (
    <div className={cn("markdown", className)}>
      <Markdown
        {...props}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
      >
        {children}
      </Markdown>
    </div>
  );
}
