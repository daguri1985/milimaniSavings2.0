// components/dashboard/DashboardSkeleton.tsx

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-28 rounded-lg" />
          <SkeletonBlock className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Top Stat Cards Skeleton Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3"
          >
            <div className="flex justify-between items-center">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
            </div>
            <SkeletonBlock className="h-7 w-28" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton (Chart + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
          <SkeletonBlock className="h-64 w-full rounded-lg" />
        </div>

        {/* Activity Skeleton */}
        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-4">
          <SkeletonBlock className="h-5 w-32" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5 w-full">
                  <SkeletonBlock className="h-3.5 w-3/4" />
                  <SkeletonBlock className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}