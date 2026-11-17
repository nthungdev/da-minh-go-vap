import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";
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
import remarkGfm from "remark-gfm";

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
      typeof src === "string" &&
      (src.startsWith("/api/media/file/") || src.includes("/api/media/file/"))
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
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
        {...props}
      >
        {children}
      </Markdown>
    </div>
  );
}
