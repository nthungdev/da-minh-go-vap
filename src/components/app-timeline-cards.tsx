import AppMarkdown from "@/components/app-markdown";
import AppSectionHeader from "@/components/app-section-header";
import { Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

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
  return (
    <div className={twMerge("space-y-12", className)}>
      {title && (
        <AppSectionHeader className="text-2xl">{title}</AppSectionHeader>
      )}

      <ol className="flex flex-col">
        {cards.map((card, index) => (
          <li
            key={index}
            className={twMerge(
              "flex",
              index % 2 === 0 ? "flex-row" : "md:flex-row-reverse",
            )}
          >
            <div className="order-last flex-1 md:order-0">
              <Link
                href={card.url || "#"}
                className="my-2 block space-y-2 rounded-lg hover:ring-2"
              >
                <div className="relative aspect-video w-full">
                  {typeof card.thumbnail !== "string" &&
                    typeof card.thumbnail.url === "string" && (
                      <Image
                        unoptimized
                        src={transformUrl(card.thumbnail.url, { width: "600" })}
                        alt={card.thumbnail.alt}
                        className="w-full rounded-lg object-cover"
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    )}
                </div>
                <h2 className="px-2 pb-1 text-center text-xl font-semibold">
                  {card.title}
                </h2>
              </Link>
            </div>

            <div className="relative px-2">
              <div
                className={twMerge(
                  `bg-primary absolute top-0 right-0 left-0 mx-auto h-full w-1`,
                  index === 0 ? "rounded-t-full" : "",
                  index === cards.length - 1 ? "rounded-b-full" : "",
                )}
              ></div>
              <div className="relative mt-2 h-8 w-8 rounded-full bg-red-300">
                {typeof card.thumbnail !== "string" &&
                  typeof card.thumbnail.url === "string" && (
                    <Image
                      unoptimized
                      src={transformUrl(card.thumbnail.url)}
                      alt={card.thumbnail.alt}
                      className="w-full rounded-lg object-cover"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  )}
              </div>
            </div>

            <div className="hidden flex-1 py-2 md:block">
              {card.description && (
                <AppMarkdown>{card.description}</AppMarkdown>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
