import { SERVICE_CATEGORIES } from "../constants/services.jsx";

export default function ServiceCategories({ selectedService, onSelectService }) {
  return (
    <section className="section-card">
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4">
        <div className="min-w-0">
          <h2 className="section-title">Browse services</h2>
          <p className="section-subtitle">Pick a category to filter technicians</p>
        </div>
        {selectedService && (
          <button
            type="button"
            onClick={() => onSelectService(null)}
            className="shrink-0 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
        {SERVICE_CATEGORIES.map((category) => {
          const isSelected = selectedService === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                onSelectService(isSelected ? null : category.id)
              }
              className={`group flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all duration-200 sm:gap-2.5 sm:rounded-2xl sm:px-3 sm:py-4 ${
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md ring-2 ring-brand-500/20"
                  : "border-slate-200/80 bg-slate-50/50 text-slate-600 hover:border-brand-200 hover:bg-white hover:shadow-sm"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors sm:h-12 sm:w-12 sm:rounded-xl ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-white text-slate-500 ring-1 ring-slate-200/80 group-hover:bg-brand-50 group-hover:text-brand-600"
                }`}
              >
                {category.icon}
              </span>
              <span className="text-center text-[11px] font-semibold leading-tight sm:text-xs">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
