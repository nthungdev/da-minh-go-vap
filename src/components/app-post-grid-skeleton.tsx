export default function AppPostGridSkeleton({ count }: { count: number }) {
  return (
    <ul className="relative grid grid-flow-row md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, index) => (
        <li
          className="animate-pulse block w-full min-w-0 bg-white border border-transparent"
          key={index}
        >
          <div className="block overflow-hidden border">
            <div className="relative aspect-video bg-gray-200"></div>
            <div className="p-2 space-y-2">
              <div className="text-center block text-xl truncate h-7 bg-gray-200"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}