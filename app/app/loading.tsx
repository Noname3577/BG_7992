export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          <div className="mt-2 h-6 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
            ></div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-900"></div>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse border-t border-gray-200 dark:border-gray-700"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
