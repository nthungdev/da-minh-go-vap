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
          className="relative flex flex-col gap-2 rounded-xs p-2"
          aria-hidden="true"
        >
          {items.map((index) => (
            <li
              key={index}
              className="block h-14 w-full bg-gray-200 motion-safe:animate-pulse"
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-busy="true">
      <AppGridHeader text={title || ""} />
      <ul
        className="relative grid grid-flow-row gap-4 md:grid-cols-2 lg:grid-cols-4"
        aria-hidden="true"
      >
        {items.map((index) => (
          <li
            key={index}
            className="block w-full min-w-0 border border-transparent bg-white"
          >
            <div className="block overflow-hidden border border-gray-300 motion-safe:animate-pulse">
              <div className="aspect-video bg-gray-200" />
              {!hidePostTitles && (
                // Two title lines: each bar plus margins equals one line box
                // (24px base, 28px lg) to match the rendered post title.
                <div className="p-1.5">
                  <div className="mx-auto my-1 h-4 w-11/12 bg-gray-200 lg:h-5" />
                  <div className="mx-auto my-1 h-4 w-2/3 bg-gray-200 lg:h-5" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
