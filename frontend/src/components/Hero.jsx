const STATS = [
  { value: "500+", label: "Verified pros" },
  { value: "4.8★", label: "Avg. rating" },
  { value: "< 30m", label: "Avg. response" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-4 py-8 shadow-glow sm:rounded-3xl sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl" />

      <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="animate-slide-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-100 ring-1 ring-white/20 sm:mb-4 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            On-demand home services
          </span>

          <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:mb-4 sm:text-3xl md:text-4xl lg:text-[2.75rem]">
            Find nearby trusted technicians
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base lg:text-lg">
            Discover verified service professionals near you. Set your location,
            choose a search radius, and book with confidence.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 animate-fade-in sm:gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15 backdrop-blur-sm sm:rounded-2xl sm:px-4 sm:py-4"
            >
              <p className="text-lg font-extrabold text-white sm:text-xl lg:text-2xl">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-brand-200 sm:mt-1 sm:text-[10px] lg:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
