import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchClientDashboard,
  updateClientProfile,
  updateOrderStatus,
} from "../api/client.js";
import Header from "../components/Header.jsx";
import BottomNavigation from "../components/BottomNavigation.jsx";
import OrderStatusBadge, { formatOrderDate } from "../components/OrderStatusBadge.jsx";
import Toast from "../components/Toast.jsx";

function StatCard({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-white text-slate-900 ring-slate-100",
    pending: "bg-amber-50 text-amber-800 ring-amber-100",
    active: "bg-indigo-50 text-indigo-800 ring-indigo-100",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  };

  return (
    <div className={`rounded-2xl p-4 ring-1 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

export default function ClientDashboard() {
  const [data, setData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    lat: "",
    lng: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchClientDashboard();
      setData(response);
      setProfileForm({
        name: response.profile.name || "",
        phone: response.profile.phone || "",
        address: response.location.address || "",
        city: response.location.city || "",
        lat: response.location.lat ?? "",
        lng: response.location.lng ?? "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await updateClientProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        lat: profileForm.lat === "" ? null : Number(profileForm.lat),
        lng: profileForm.lng === "" ? null : Number(profileForm.lng),
      });
      setData((prev) => ({
        ...prev,
        profile: response.profile,
        location: response.location,
      }));
      setToast("Profile and location updated.");
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "cancelled");
      await loadDashboard();
      setToast("Order cancelled.");
    } catch (err) {
      setToast(err.message);
    }
  };

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Client dashboard
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {data.profile.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your profile, saved location, and booking history.
            </p>
          </div>
          <Link to="/" className="btn-primary w-full sm:w-auto">
            Find technicians
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total orders" value={data.stats.total} />
          <StatCard label="Pending" value={data.stats.pending} tone="pending" />
          <StatCard label="In progress" value={data.stats.inProgress} tone="active" />
          <StatCard label="Completed" value={data.stats.completed} tone="success" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <section className="section-card">
            <h2 className="section-title">Order history</h2>
            <p className="section-subtitle">All bookings linked to your account</p>

            {data.orders.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-sm font-medium text-slate-600">No orders yet.</p>
                <Link to="/" className="mt-3 inline-flex text-sm font-semibold text-brand-600">
                  Book your first technician
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {data.orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{order.service}</h3>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          with {order.technicianName}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Booked: {formatOrderDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Scheduled: {formatOrderDate(order.scheduledAt)}
                        </p>
                        <p className={`text-xs font-semibold ${order.payment?.status === "paid" ? "text-emerald-600" : order.payment?.submittedAt ? "text-amber-600" : "text-slate-500"}`}>
                          Payment: {order.payment?.status === "paid" ? "Paid" : order.payment?.submittedAt ? "Submitted, awaiting admin" : "Pending"}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-extrabold text-brand-700">₹{order.price}</p>
                        <Link
                          to={`/booking/order/${order.id}`}
                          className="mt-2 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Track booking
                        </Link>
                        {order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="mt-2 text-sm font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Cancel order
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="section-card">
              <h2 className="section-title">Your details</h2>
              <p className="section-subtitle">Update contact information</p>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Name</span>
                  <input
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</span>
                  <input
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
                  <input
                    value={data.profile.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
                  />
                </label>

                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? "Saving..." : "Save details"}
                </button>
              </form>
            </section>

            <section className="section-card">
              <h2 className="section-title">Saved location</h2>
              <p className="section-subtitle">Used for nearby technician search and bookings</p>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Address</span>
                  <input
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">City</span>
                  <input
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Latitude</span>
                    <input
                      value={profileForm.lat}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, lat: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Longitude</span>
                    <input
                      value={profileForm.lng}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, lng: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? "Saving..." : "Save location"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
