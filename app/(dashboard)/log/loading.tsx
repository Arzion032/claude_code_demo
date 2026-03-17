export default function LogLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-gray-100" />
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="h-3 w-8 rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>
            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
