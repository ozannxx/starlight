export default function Loading() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="glass h-40 animate-pulse rounded-[1.75rem]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <div className="glass h-64 animate-pulse rounded-[1.75rem]" />
        <div className="glass h-64 animate-pulse rounded-[1.75rem]" />
        <div className="glass h-64 animate-pulse rounded-[1.75rem]" />
      </div>
    </div>
  );
}