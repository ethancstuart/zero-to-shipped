import { Skeleton } from "@/components/ui/skeleton";

export default function SkillTreeLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );
}
