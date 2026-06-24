export function CalendarLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading calendar">
      <p className="text-sm text-gray-body">
        Loading your schedule…
      </p>
      <div className="grid gap-4 lg:grid-cols-7">
        {Array.from({ length: 14 }, (_, index) => (
          <div
            key={index}
            className="min-h-[180px] animate-pulse rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card"
          />
        ))}
      </div>
    </div>
  );
}
