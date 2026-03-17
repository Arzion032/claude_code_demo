function SkeletonCard({ height = "h-24" }: { height?: string }) {
  return (
    <div className={`${height} animate-pulse rounded-2xl border border-gray-200 bg-gray-100`} />
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* MoodForm skeleton */}
      <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-100" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 h-16 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-20 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-emerald-100" />
      </div>

      {/* Heatmap skeleton */}
      <SkeletonCard height="h-36" />

      {/* Word cloud skeleton */}
      <SkeletonCard height="h-48" />

      {/* Weekly summary skeleton */}
      <SkeletonCard height="h-28" />
    </div>
  );
}
