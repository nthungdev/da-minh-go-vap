export default function AppPostGridSkeleton({ count }: { count: number }) {
  const placeholders = Array.from(
    { length: count },
    (_, index) => `skeleton-${index}`,
  );

  return (
    <div>
      <div className="mb-4 block h-7 truncate bg-gray-200 text-center text-xl"></div>
      <ul className="relative grid grid-flow-row gap-4 md:grid-cols-2 lg:grid-cols-4">
        {placeholders.map((key) => (
          <li
            className="block w-full min-w-0 animate-pulse border border-transparent bg-white"
            key={key}
          >
            <div className="block overflow-hidden border">
              <div className="relative aspect-video bg-gray-200"></div>
              <div className="space-y-2 p-2">
                <div className="block h-7 truncate bg-gray-200 text-center text-xl"></div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
