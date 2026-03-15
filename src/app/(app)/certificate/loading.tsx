import { Skeleton } from "@/components/ui/skeleton";

export default function CertificateLoading() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Skeleton className="mx-auto size-12 rounded-full" />
      <Skeleton className="mx-auto mt-4 h-8 w-56" />
      <Skeleton className="mx-auto mt-2 h-5 w-80" />
      <div className="mt-8 rounded-xl border border-border bg-card p-12">
        <Skeleton className="mx-auto h-4 w-48" />
        <Skeleton className="mx-auto mt-4 h-8 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-56" />
        <Skeleton className="mx-auto mt-6 h-6 w-40" />
        <Skeleton className="mx-auto mt-2 h-4 w-72" />
      </div>
      <Skeleton className="mx-auto mt-6 h-10 w-48" />
    </div>
  );
}
