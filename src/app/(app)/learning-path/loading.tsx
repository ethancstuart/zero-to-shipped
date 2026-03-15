import { Skeleton } from "@/components/ui/skeleton";

export default function LearningPathLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section}>
          <Skeleton className="mb-3 h-6 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="mt-1 h-4 w-32" />
                </div>
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
