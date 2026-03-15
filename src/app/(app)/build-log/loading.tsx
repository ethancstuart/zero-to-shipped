import { Skeleton } from "@/components/ui/skeleton";

export default function BuildLogLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-1 h-4 w-32" />
              </div>
            </div>
            <div className="mt-3 space-y-1 pl-11">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
