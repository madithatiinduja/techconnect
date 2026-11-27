import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Browser } from "@capacitor/browser";
import {
  createOrder,
  fetchTechnicianById,
  initiatePhonePePayment,
} from "../api/client.js";
import BottomNavigation from "../components/BottomNavigation.jsx";
import Header from "../components/Header.jsx";
import Toast from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function toDateTimeInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default function BookingPage() {
  const { technicianId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("phonepe");
  const paymentOptions = [
    { value: "phonepe", label: "PhonePe" },
    { value: "cash", label: "Cash" },
  ];

  const [form, setForm] = useState(() => ({
    address: user?.address || "",
    scheduledAt: toDateTimeInputValue(new Date(Date.now() + 60 * 60000)),
  }));

  const clientLat = useMemo(() => {
    const queryLat = Number(searchParams.get("lat"));
    return Number.isFinite(queryLat) ? queryLat : user?.lat ?? null;
  }, [searchParams, user?.lat]);

  const clientLng = useMemo(() => {
    const queryLng = Number(searchParams.get("lng"));
    return Number.isFinite(queryLng) ? queryLng : user?.lng ?? null;
  }, [searchParams, user?.lng]);

  const continuePhonePePayment = async (orderId) => {
    try {
      const payment = await initiatePhonePePayment(orderId);
      if (!payment.checkoutUrl) {
        navigate(`/booking/order/${orderId}`, { replace: true });
        return;
      }

      navigate(`/booking/order/${orderId}`, { replace: true });
      if (
        window.location.protocol === "capacitor:" ||
        window.Capacitor?.isNativePlatform?.()
      ) {
        await Browser.open({ url: payment.checkoutUrl });
      } else {
        window.location.assign(payment.checkoutUrl);
      }
    } catch (err) {
      setToast(err.message);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadTechnician() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchTechnicianById(technicianId, {
          lat: clientLat,
          lng: clientLng,
        });
        if (!active) return;
        setTechnician(response.technician);
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTechnician();
    return () => {
      active = false;
    };
  }, [technicianId, clientLat, clientLng]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.address.trim()) {
      setToast("Please enter your service address.");
      return;
    }

    if (!technician) {
      setToast("Technician details are still loading.");
      return;
    }

    setSaving(true);
    try {
      const response = await createOrder({
        technicianId: technician.id,
        service: technician.service,
        price: technician.price,
        address: form.address.trim(),
        lat: clientLat,
        lng: clientLng,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        paymentMethod,
        paymentStatus: "pending",
      });

      const orderId = response?.order?.id;
      if (orderId) {
        setConfirmedOrderId(orderId);
        if (paymentMethod === "phonepe") {
          await continuePhonePePayment(orderId);
          return;
        }
        navigate(`/booking/order/${orderId}`, { replace: true });
      }
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell min-h-screen min-h-[100dvh]">
      <Header />
      <Toast message={toast} onDismiss={() => setToast("")} />

      <main className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Booking confirmation
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Confirm your technician booking
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              This page keeps working even if you refresh it.
            </p>
          </div>
          <Link to="/" className="btn-secondary w-full sm:w-auto">
            Back to technicians
          </Link>
        </div>

        {loading && (
          <div className="section-card">
            <div className="skeleton h-7 w-48" />
            <div className="mt-4 space-y-3">
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="section-card border-rose-200 bg-rose-50 text-rose-700">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && technician && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <section className="section-card">
              <div className="flex items-start gap-4">
                <img
                  src={technician.image}
                  alt={technician.name}
                  className="h-20 w-20 rounded-2xl bg-slate-100 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-600">{technician.service}</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                    {technician.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {technician.city} {technician.distanceKm ? `· ${technician.distanceKm} km away` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Rating
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {technician.rating}/5
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Visit price
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">Rs {technician.price}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                <p className="text-sm font-semibold text-indigo-900">After booking you will get</p>
                <ul className="mt-2 space-y-2 text-sm text-indigo-700">
                  <li>Live arrival ETA</li>
                  <li>Technician call button</li>
                  <li>Unique 4-digit security code</li>
                </ul>
              </div>
            </section>

            <section className="section-card">
              <h2 className="section-title">Booking details</h2>
              <p className="section-subtitle">Choose when and where the technician should arrive</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Service address
                  </span>
                  <textarea
                    rows="4"
                    value={form.address}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="Enter full address"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Schedule time
                  </span>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Client coordinates:{" "}
                  {clientLat !== null && clientLng !== null
                    ? `${clientLat.toFixed(4)}, ${clientLng.toFixed(4)}`
                    : "Not available"}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Payment</p>
                      <p className="text-xs text-slate-500">Choose how you want to pay</p>
                    </div>
                    <div className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                      ₹{technician?.price ?? 0}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPaymentMethod(option.value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          paymentMethod === option.value
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "phonepe" && (
                    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-800">
                      Secure checkout opens PhonePe. Your booking is marked paid only after PhonePe confirms the payment.
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Cash payment will be collected directly at the service location after the job is completed.
                    </div>
                  )}
                </div>

                {confirmedOrderId && paymentMethod === "cash" && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Your booking is confirmed. Pay the technician in cash when the service is completed.
                  </div>
                )}

                {confirmedOrderId ? (
                  <button
                    type="button"
                    onClick={() =>
                      paymentMethod === "phonepe"
                        ? continuePhonePePayment(confirmedOrderId)
                        : navigate(`/booking/order/${confirmedOrderId}`, { replace: true })
                    }
                    className="btn-primary w-full"
                  >
                    {paymentMethod === "phonepe" ? "Continue to PhonePe" : "View booking status"}
                  </button>
                ) : (
                  <button type="submit" disabled={saving} className="btn-primary w-full">
                    {saving ? "Booking technician..." : "Confirm booking & pay"}
                  </button>
                )}
              </form>
            </section>
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
