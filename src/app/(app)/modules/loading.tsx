import { Skeleton } from "@/components/ui/skeleton";

export default function ModulesLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {Array.from({ length: 3 }).map((_, tier) => (
        <div key={tier}>
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="space-y-3">
            {Array.from({ length: tier === 0 ? 5 : 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="size-5 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
