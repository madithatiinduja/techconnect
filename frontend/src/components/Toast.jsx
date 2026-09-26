export default function Toast({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 animate-slide-up safe-bottom sm:bottom-6 sm:w-[calc(100%-2rem)]">
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-white px-3 py-3 shadow-card-hover ring-1 ring-emerald-100 sm:rounded-2xl sm:px-4 sm:py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 sm:h-8 sm:w-8 sm:rounded-xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto shrink-0 text-slate-400 transition hover:text-slate-600"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
