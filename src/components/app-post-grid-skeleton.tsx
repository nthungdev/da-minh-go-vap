interface AppPostGridSkeletonProps {
  count: number;
  hidePostTitles?: boolean;
  showHeader?: boolean;
}

export default function AppPostGridSkeleton({
  count,
  hidePostTitles,
  showHeader = true,
}: AppPostGridSkeletonProps) {
  const placeholders = Array.from(
    { length: count },
    (_, index) => `skeleton-${index}`,
  );

  return (
    <div className="space-y-stack" aria-busy="true">
      {showHeader && (
        <div
          aria-hidden="true"
          className="h-6 w-full rounded-md bg-surface-muted motion-safe:animate-pulse md:h-8"
        />
      )}
      <ul
        aria-hidden="true"
        className="relative grid grid-flow-row gap-stack md:grid-cols-2 md:gap-gutter lg:grid-cols-4"
      >
        {placeholders.map((key) => (
          <li className="min-w-0" key={key}>
            <div className="block size-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm motion-safe:animate-pulse">
              <div className="relative aspect-video bg-surface-muted" />
              {!hidePostTitles && (
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
