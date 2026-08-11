export default function LocationRadiusPanel({
  location,
  radius,
  loadingLocation,
  onUpdateLocation,
  onRadiusChange,
}) {
  return (
    <section className="section-card">
      <div className="mb-4 sm:mb-5">
        <h2 className="section-title">Location & radius</h2>
        <p className="section-subtitle">
          Adjust where we search for available technicians
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 sm:h-10 sm:w-10 sm:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                Your location
              </p>
              <p className="mt-0.5 truncate text-sm font-bold tabular-nums text-slate-900 sm:text-base">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onUpdateLocation}
            disabled={loadingLocation}
            className="btn-secondary w-full sm:w-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M21 12a9 9 0 11-2.64-6.36" strokeLinecap="round" />
              <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {loadingLocation ? "Updating..." : "Refresh"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 sm:rounded-2xl sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 sm:h-10 sm:w-10 sm:rounded-xl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                Search radius
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-brand-600 px-2 py-0.5 text-xs font-bold tabular-nums text-white sm:px-2.5 sm:py-1 sm:text-sm">
              {radius} km
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
          />

          <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400 sm:text-[11px]">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>
    </section>
  );
}
