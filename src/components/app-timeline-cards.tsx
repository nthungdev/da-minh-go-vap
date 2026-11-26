import Image from "next/image";
import Link from "next/link";
import AppMarkdown from "@/components/app-markdown";
import AppSectionHeader from "@/components/app-section-header";
import type { Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

interface AppTimelineCardsProps {
  className?: string;
  cards: {
    title: string;
    description?: string;
    thumbnail: Media | string;
    url?: string;
  }[];
  title: string;
}

export default function AppTimelineCards({
  className,
  cards,
  title,
}: AppTimelineCardsProps) {
  const CardHeading = title ? "h3" : "h2";

  return (
    <div className={cn("space-y-8 md:space-y-10", className)}>
      {title && (
        <AppSectionHeader className="text-2xl">{title}</AppSectionHeader>
      )}

      <ol className="flex flex-col">
        {cards.map((card, index) => {
          const url = card.url?.trim();
          const isReversed = index % 2 !== 0;
          const cardContent = (
            <>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-muted">
                {typeof card.thumbnail !== "string" &&
                  typeof card.thumbnail.url === "string" && (
                    <Image
                      unoptimized
                      src={transformUrl(card.thumbnail.url, { width: "600" })}
                      alt={card.thumbnail.alt}
                      className="w-full object-cover"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  )}
              </div>
              <CardHeading className="px-2 pb-1 text-center text-xl font-semibold text-foreground">
                {card.title}
              </CardHeading>
            </>
          );

          return (
            <li
              key={`${card.title}-${card.url ?? ""}`}
              className="grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
            >
              <div
                className={cn(
                  "col-start-2 row-start-1",
                  isReversed ? "md:col-start-3" : "md:col-start-1",
                )}
              >
                {url ? (
                  <Link
                    href={url}
                    className="my-2 block space-y-2 rounded-xl border border-border bg-surface p-2 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div className="my-2 space-y-2 rounded-xl border border-border bg-surface p-2 shadow-sm">
                    {cardContent}
                  </div>
                )}
              </div>

              <div className="relative col-start-1 row-start-1 row-end-3 px-2 md:col-start-2 md:row-end-2">
                <div
                  className={cn(
                    "absolute top-0 right-0 left-0 mx-auto h-full w-1 bg-primary",
                    index === 0 && "rounded-t-full",
                    index === cards.length - 1 && "rounded-b-full",
                  )}
                ></div>
                <div className="relative mt-2 h-8 w-8 overflow-hidden rounded-full bg-accent ring-2 ring-primary/30">
                  {typeof card.thumbnail !== "string" &&
                    typeof card.thumbnail.url === "string" && (
                      <Image
                        unoptimized
                        src={transformUrl(card.thumbnail.url, { width: "64" })}
                        alt=""
                        aria-hidden="true"
                        className="w-full rounded-full object-cover"
                        fill
                        sizes="32px"
                      />
                    )}
                </div>
              </div>

              {card.description && (
                <div
                  className={cn(
                    "col-start-2 row-start-2 px-2 pb-2 text-sm text-foreground-muted md:row-start-1 md:px-3 md:py-2 md:text-base md:text-foreground",
                    isReversed ? "md:col-start-1" : "md:col-start-3",
                  )}
                >
                  <AppMarkdown>{card.description}</AppMarkdown>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
