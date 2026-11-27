import { useEffect, useMemo, useState } from "react";
import { acceptOrderPayment, fetchAdminDashboard } from "../api/client.js";
import Header from "../components/Header.jsx";
import BottomNavigation from "../components/BottomNavigation.jsx";
import Toast from "../components/Toast.jsx";

function StatCard({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-white text-slate-900 ring-slate-100",
    info: "bg-cyan-50 text-cyan-800 ring-cyan-100",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    danger: "bg-rose-50 text-rose-800 ring-rose-100",
    warning: "bg-amber-50 text-amber-800 ring-amber-100",
  };

  return (
    <div className={`rounded-2xl p-4 ring-1 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-current/70">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminDashboard();
      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPayment = async (orderId) => {
    try {
      await acceptOrderPayment(orderId);
      setToast("Payment accepted.");
      await loadDashboard();
    } catch (err) {
      setToast(err.message);
    }
  };

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, 10000);

    return () => clearInterval(timer);
  }, []);

  const kpis = useMemo(() => {
    if (!data) return [];

    return [
      { label: "Total bookings", value: data.stats.totalOrders, tone: "info" },
      { label: "Pending", value: data.stats.pending, tone: "warning" },
      { label: "Verified techs", value: data.stats.verifiedTechnicians, tone: "success" },
      { label: "Live jobs", value: data.stats.activeJobs, tone: "danger" },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="app-shell min-h-screen">
        <Header />
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell min-h-screen">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen min-h-[100dvh]">
      <Header />
      <Toast message={toast} onDismiss={() => setToast("")} />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Admin dashboard</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Operations overview</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await loadDashboard();
              setToast("Admin data refreshed.");
            }}
            className="btn-primary w-full sm:w-auto"
          >
            Refresh data
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} tone={item.tone} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="section-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Recent bookings</h2>
                <p className="section-subtitle">Latest service requests from clients</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {data.orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  No recent bookings yet.
                </div>
              ) : (
                data.orders.slice(0, 5).map((order) => (
                  <article key={order.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{order.service}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">Client: {order.clientName} • Tech: {order.technicianName}</p>
                        <p className={`mt-2 text-xs font-bold uppercase tracking-wide ${order.paymentStatus === "paid" ? "text-emerald-600" : order.paymentSubmittedAt ? "text-amber-600" : "text-slate-500"}`}>
                          Payment: {order.paymentStatus === "paid" ? "Paid" : order.paymentSubmittedAt ? "Submitted for review" : "Pending"} via {order.paymentMethod}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-extrabold text-brand-700">₹{order.price}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        {order.paymentStatus !== "paid" && (
                          <button
                            type="button"
                            onClick={() => handleAcceptPayment(order.id)}
                            className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Accept payment & booking
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="section-card">
            <h2 className="section-title">Trust & coverage</h2>
            <p className="section-subtitle">Platform health snapshot</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Verified technicians</p>
                  <span className="text-lg font-black text-brand-700">{data.trust.verified}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${data.trust.verificationRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{data.trust.verificationRate}% of active technicians verified</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Operational summary</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Active areas: {data.summary.areas}</li>
                  <li>• Avg. response: {data.summary.avgResponse}</li>
                  <li>• Rating score: {data.summary.rating}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <section className="section-card">
          <h2 className="section-title">Technician roster</h2>
          <p className="section-subtitle">Trusted professionals currently listed</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.technicians.map((tech) => (
              <article key={tech.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{tech.name}</h3>
                    <p className="text-sm text-slate-500">{tech.service}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${tech.trusted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {tech.trusted ? "Trusted" : "New"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>⭐ {tech.rating}</span>
                  <span>{tech.distanceKm} km away</span>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {tech.city} • {tech.experience}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}
