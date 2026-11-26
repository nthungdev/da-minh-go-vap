import AppGridHeader from "@/components/app-grid-header";
import AppSectionHeader from "@/components/app-section-header";

interface PostGroupSkeletonProps {
  type: "grid" | "list";
  limit: number;
  title?: string | null;
  hidePostTitles?: boolean | null;
}

/**
 * Suspense fallback for `PostGroup`. Mirrors the grid/list geometry (header,
 * card aspect ratios, row heights) so streamed posts replace it in place.
 */
export default function PostGroupSkeleton({
  type,
  limit,
  title,
  hidePostTitles,
}: PostGroupSkeletonProps) {
  const items = Array.from({ length: limit }, (_, index) => index);

  if (type === "list") {
    return (
      <div className="@container" aria-busy="true">
        {title && (
          <AppSectionHeader className="text-sm uppercase @md:text-base">
            {title}
          </AppSectionHeader>
        )}
        <ul
          className="relative flex flex-col gap-2 rounded-lg p-2"
          aria-hidden="true"
        >
          {items.map((index) => (
            <li
              key={index}
              className="block h-14 w-full rounded-xl bg-surface-muted motion-safe:animate-pulse"
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-stack" aria-busy="true">
      <AppGridHeader text={title || ""} />
      <ul
        className="relative grid grid-flow-row gap-stack md:grid-cols-2 md:gap-gutter lg:grid-cols-4"
        aria-hidden="true"
      >
        {items.map((index) => (
          <li key={index} className="min-w-0">
            <div className="block size-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm motion-safe:animate-pulse">
              <div className="aspect-video bg-surface-muted" />
              {!hidePostTitles && (
                // Matches AppPostGrid's p-card-sm text-base leading-snug title block
                <div className="space-y-1.5 p-card-sm">
                  <div className="h-[18px] w-11/12 rounded-sm bg-surface-muted" />
                  <div className="h-[18px] w-2/3 rounded-sm bg-surface-muted" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
