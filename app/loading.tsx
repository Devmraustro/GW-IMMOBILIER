import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="container-page py-16">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}
