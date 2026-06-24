export function CalendarLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading calendar">
      <p className="text-sm text-gray-body">Loading your schedule…</p>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-8 animate-pulse rounded-full bg-cream" />
          <div className="h-7 w-40 animate-pulse rounded bg-cream" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-cream" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }, (_, index) => (
            <div
              key={index}
              className="min-h-[108px] animate-pulse rounded-xl border border-black/[0.06] bg-cream/40 p-2.5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
