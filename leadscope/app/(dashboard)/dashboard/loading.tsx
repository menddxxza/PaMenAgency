import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-8 w-28" />
      </div>
      <main className="flex-1 space-y-3 p-4 sm:p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </main>
    </>
  );
}
