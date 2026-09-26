const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  accepted: "bg-blue-50 text-blue-700 ring-blue-100",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
};

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 sm:text-xs ${
        STATUS_STYLES[status] || "bg-slate-50 text-slate-600 ring-slate-100"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function formatOrderDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
