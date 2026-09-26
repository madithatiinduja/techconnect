import TechnicianCard from "./TechnicianCard.jsx";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card sm:rounded-2xl">
      <div className="skeleton h-1 w-full sm:h-1.5" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <div className="skeleton h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16 sm:rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/5 rounded-lg" />
            <div className="skeleton h-4 w-2/5 rounded-lg" />
            <div className="skeleton h-4 w-4/5 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="skeleton h-12 rounded-lg sm:h-14 sm:rounded-xl" />
          <div className="skeleton h-12 rounded-lg sm:h-14 sm:rounded-xl" />
        </div>
        <div className="skeleton h-10 rounded-xl" />
      </div>
    </div>
  );
}

export default function TechnicianList({
  technicians,
  loading,
  error,
  onBook,
  onClearFilter,
  hasActiveFilter,
}) {
  const countLabel = loading
    ? "Searching nearby..."
    : `${technicians.length} technician${technicians.length !== 1 ? "s" : ""} found`;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="section-title">{countLabel}</h3>
          {!loading && technicians.length > 0 && (
            <p className="section-subtitle">Sorted by distance from you</p>
          )}
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="btn-secondary w-full shrink-0 text-brand-600 sm:w-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:rounded-2xl sm:p-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-5 w-5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && technicians.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center sm:rounded-2xl sm:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:h-14 sm:w-14 sm:rounded-2xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 sm:h-7 sm:w-7">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 sm:text-base">
            No technicians found in your area
          </p>
          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Try increasing the radius or choosing a different category.
          </p>
        </div>
      )}

      {!loading && !error && technicians.length > 0 && (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {technicians.map((technician, index) => (
            <div
              key={technician.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
            >
              <TechnicianCard technician={technician} onBook={onBook} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
