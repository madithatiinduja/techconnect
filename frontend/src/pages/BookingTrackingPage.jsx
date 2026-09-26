import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchOrderById } from "../api/client.js";
import BottomNavigation from "../components/BottomNavigation.jsx";
import Header from "../components/Header.jsx";
import OrderStatusBadge, { formatOrderDate } from "../components/OrderStatusBadge.jsx";

function formatCoordinate(value) {
  return typeof value === "number" ? value.toFixed(5) : "--";
}

function formatEta(etaMinutes) {
  if (etaMinutes === null || etaMinutes === undefined) return "Unavailable";
  if (etaMinutes === 0) return "Arrived";
  if (etaMinutes < 60) return `${etaMinutes} min`;
  const hours = Math.floor(etaMinutes / 60);
  const minutes = etaMinutes % 60;
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

const UPI_PAYMENT_ID = "9390719199-2@ybl";

export default function BookingTrackingPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      const response = await fetchOrderById(orderId);
      setOrder(response.order);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadOrder();
    }, 15000);

    return () => clearInterval(timer);
  }, [loadOrder]);

  const tracking = order?.tracking;
  const paymentSubmitted = searchParams.get("payment") === "submitted";
  const paymentQrUrl = useMemo(() => {
    if (order?.payment?.method !== "upi") return "";
    const encoded = encodeURIComponent(
      `upi://pay?pa=${UPI_PAYMENT_ID}&pn=TechConnect Services&am=${Number(order.price) || 0}&cu=INR&tn=TechConnect booking - ${order.service || "service"}`
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`;
  }, [order?.payment?.method, order?.price, order?.service]);
  const telHref = useMemo(() => {
    const raw = order?.technicianPhone || "";
    return `tel:${raw.replace(/\s+/g, "")}`;
  }, [order?.technicianPhone]);

  return (
    <div className="app-shell min-h-screen min-h-[100dvh]">
      <Header />

      <main className="mx-auto w-full max-w-6xl space-y-6 px-3 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Live booking
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Track your technician
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              This page reloads from the order ID, so refresh will not break it.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/dashboard/client" className="btn-secondary">
              View all bookings
            </Link>
            <button type="button" onClick={loadOrder} className="btn-primary">
              Refresh tracking
            </button>
          </div>
        </div>

        {loading && (
          <div className="section-card">
            <div className="skeleton h-8 w-56" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="skeleton h-28 w-full" />
              <div className="skeleton h-28 w-full" />
              <div className="skeleton h-28 w-full" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="section-card border-rose-200 bg-rose-50 text-rose-700">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && order && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <section className="section-card md:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={order.technician?.image}
                      alt={order.technicianName}
                      className="h-16 w-16 rounded-2xl bg-slate-100 object-cover"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {order.technicianName}
                        </h2>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{order.service}</p>
                      <p className="text-xs text-slate-500">
                        Scheduled: {formatOrderDate(order.scheduledAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={telHref} className="btn-primary">
                      Call technician
                    </a>
                    <Link to="/" className="btn-secondary">
                      Book another
                    </Link>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Arrival progress</p>
                      <p className="text-xs text-slate-500">
                        Technician current location updates every 15 seconds
                      </p>
                    </div>
                    <p className="text-lg font-extrabold text-brand-700">
                      {tracking?.progressPercent ?? 0}%
                    </p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all"
                      style={{ width: `${tracking?.progressPercent ?? 0}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        ETA
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        {formatEta(tracking?.etaMinutes)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Distance left
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        {tracking?.remainingDistanceKm ?? "--"} km
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Total fare
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        Rs {order.price}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Payment
                      </p>
                      <p className="mt-1 text-sm font-extrabold uppercase text-slate-900">
                        {order.payment?.method || "cash"}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {order.payment?.status === "paid"
                          ? "Paid"
                          : order.payment?.submittedAt
                            ? "Submitted, awaiting admin"
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section-card">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  Security code
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-[0.25em] text-slate-900">
                  {order.securityCode}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Share this 4-digit code only when the technician arrives.
                </p>
              </section>
            </div>

            {order.payment?.method === "upi" && order.payment?.status !== "paid" && !paymentSubmitted && (
              <section className="section-card">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                  <div className="rounded-2xl border-4 border-slate-200 bg-white p-2">
                    <img
                      src={paymentQrUrl}
                      alt="UPI payment QR code"
                      className="h-44 w-44 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                      Payment awaiting admin confirmation
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                      Scan to pay Rs {order.price}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Complete the UPI payment, then wait for the admin to accept the payment and booking.
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-700">{UPI_PAYMENT_ID}</p>
                  </div>
                </div>
              </section>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="section-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="section-title">Current location</h2>
                    <p className="section-subtitle">
                      Simulated live technician location similar to ride-tracking apps
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Updated: {formatOrderDate(tracking?.lastUpdatedAt)}
                  </p>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Technician current coordinates
                      </p>
                      <p className="mt-2 text-xl font-extrabold">
                        {formatCoordinate(tracking?.currentLat)},{" "}
                        {formatCoordinate(tracking?.currentLng)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                        Destination
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {formatCoordinate(order.lat)}, {formatCoordinate(order.lng)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/30" />
                    <div className="h-1.5 flex-1 rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{ width: `${tracking?.progressPercent ?? 0}%` }}
                      />
                    </div>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 shadow-lg shadow-rose-500/30" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                    <span>Technician start</span>
                    <span>Your location</span>
                  </div>
                </div>
              </section>

              <section className="section-card">
                <h2 className="section-title">Booking details</h2>
                <div className="mt-5 space-y-4 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service address
                    </p>
                    <p className="mt-1 font-medium text-slate-800">{order.address}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Technician phone
                    </p>
                    <p className="mt-1 font-medium text-slate-800">{order.technicianPhone}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order ID
                    </p>
                    <p className="mt-1 font-medium text-slate-800">{order.id}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Payment status
                    </p>
                    <p className="mt-1 font-medium capitalize text-slate-800">
                      {order.payment?.status || "pending"} via {order.payment?.method || "cash"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
