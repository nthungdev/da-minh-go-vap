/**
 * Route fallback for public pages: lets the layout (navbar, footer) stream
 * while page data loads. `min-h-svh` keeps the footer below the fold so it
 * does not jump when the page replaces this skeleton.
 */
export default function Loading() {
  return (
    <div className="min-h-svh w-full" role="status" aria-busy="true">
      <span className="sr-only">Đang tải…</span>
      <div
        className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-16 pb-8 motion-safe:animate-pulse"
        aria-hidden="true"
      >
        <div className="mx-auto h-8 w-1/2 bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="aspect-video bg-gray-200" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200" />
          <div className="h-4 w-11/12 bg-gray-200" />
          <div className="h-4 w-4/5 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
