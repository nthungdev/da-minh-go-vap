export default function AppPostGridSkeleton({ count }: { count: number }) {
  return (
    <ul className="relative grid grid-flow-row gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(count)].map((_, index) => (
        <li
          className="block w-full min-w-0 animate-pulse border border-transparent bg-white"
          key={index}
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
  );
}
