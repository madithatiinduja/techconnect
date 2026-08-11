function StarRating({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-100 sm:text-sm">
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating}
    </span>
  );
}

export default function TechnicianCard({ technician, onBook }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover sm:rounded-2xl">
      <div className="relative h-1 bg-gradient-to-r from-brand-400 via-brand-600 to-indigo-600 sm:h-1.5" />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={technician.image}
              alt={technician.name}
              className="h-14 w-14 rounded-xl bg-slate-100 object-cover ring-2 ring-white sm:h-16 sm:w-16 sm:rounded-2xl"
            />
            {technician.available && (
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 sm:h-4 sm:w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h4 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                {technician.name}
              </h4>
              {technician.trusted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100 sm:text-[11px]">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-brand-600">{technician.service}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm">
              <StarRating rating={technician.rating} />
              <span className="hidden text-slate-400 sm:inline">·</span>
              <span>{technician.reviews} reviews</span>
              <span className="text-slate-400">·</span>
              <span>{technician.experience}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:gap-3">
          <div className="rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100 sm:rounded-xl sm:px-3 sm:py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
              Distance
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-800 sm:text-base">
              {technician.distanceKm} km
            </p>
          </div>
          <div className="rounded-lg bg-brand-50 px-2.5 py-2 ring-1 ring-brand-100 sm:rounded-xl sm:px-3 sm:py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-400 sm:text-[11px]">
              Starting at
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-800 sm:text-base">
              ₹{technician.price}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
              technician.available ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                technician.available ? "bg-emerald-500" : "bg-rose-400"
              }`}
            />
            {technician.available ? "Available now" : "Busy"}
          </span>
          <button
            type="button"
            onClick={() => onBook(technician)}
            disabled={!technician.available}
            className="btn-primary w-full sm:w-auto"
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}
