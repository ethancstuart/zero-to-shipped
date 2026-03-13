import { Skeleton } from "@/components/ui/skeleton";

export default function ModuleReaderLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-1 h-4 w-20" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Content + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Content */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 w-full"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
          <Skeleton className="mt-6 h-32 w-full rounded-lg" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={`p2-${i}`}
              className="h-4 w-full"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="mb-4 h-2 w-full rounded-full" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                  <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
