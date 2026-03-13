import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-9 w-16" />
          </div>
        ))}
      </div>

      {/* Next Steps & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="mb-4 h-5 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="mt-3 h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="mb-4 h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
