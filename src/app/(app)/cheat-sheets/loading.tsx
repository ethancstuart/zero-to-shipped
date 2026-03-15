import { Skeleton } from "@/components/ui/skeleton";

export default function CheatSheetsLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-3 size-6" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
