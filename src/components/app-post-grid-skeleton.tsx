export default function AppPostGridSkeleton({ count }: { count: number }) {
  const placeholders = Array.from(
    { length: count },
    (_, index) => `skeleton-${index}`,
  );

  return (
    <div>
      <div className="mb-4 block h-7 truncate rounded-md bg-surface-muted text-center text-xl motion-safe:animate-pulse" />
      <ul className="relative grid grid-flow-row gap-stack md:grid-cols-2 md:gap-gutter lg:grid-cols-4">
        {placeholders.map((key) => (
          <li
            className="block w-full min-w-0 rounded-xl border border-border bg-surface shadow-xs motion-safe:animate-pulse"
            key={key}
          >
            <div className="block overflow-hidden rounded-xl">
              <div className="relative aspect-video bg-surface-muted" />
              <div className="space-y-2 p-card-sm">
                <div className="block h-6 truncate rounded-sm bg-surface-muted" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
