import { useEffect, useState } from "react";
import {
  fetchTechnicianDashboard,
  updateOrderStatus,
  updateTechnicianProfile,
} from "../api/client.js";
import { SERVICE_CATEGORIES } from "../constants/services.jsx";
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

export default function TechnicianDashboard() {
  const [data, setData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    lat: "",
    lng: "",
    service: "",
    experience: "",
    bio: "",
    serviceRadiusKm: 5,
    available: true,
    profilePhoto: null,
    idVerification: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchTechnicianDashboard();
      setData(response);
      setProfileForm({
        name: response.profile.name || "",
        phone: response.profile.phone || "",
        address: response.location.address || "",
        city: response.location.city || "",
        lat: response.location.lat ?? "",
        lng: response.location.lng ?? "",
        service: response.profile.service || "",
        experience: response.profile.experience || "",
        bio: response.profile.bio || "",
        serviceRadiusKm: response.location.serviceRadiusKm || 5,
        available: response.profile.available ?? true,
        profilePhoto: null,
        idVerification: null,
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
      const response = await updateTechnicianProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        lat: profileForm.lat === "" ? null : Number(profileForm.lat),
        lng: profileForm.lng === "" ? null : Number(profileForm.lng),
        service: profileForm.service,
        experience: profileForm.experience,
        bio: profileForm.bio,
        serviceRadiusKm: Number(profileForm.serviceRadiusKm),
        available: profileForm.available,
      });
      setData((prev) => ({
        ...prev,
        profile: response.profile,
        location: response.location,
        requirements: response.requirements,
        progress: response.progress,
      }));
      setToast("Profile updated successfully!");
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRequirementAction = async (requirementId) => {
    try {
      // For demo purposes, just mark as complete
      const response = await updateTechnicianProfile({
        requirementId,
        completed: true,
      });
      setData((prev) => ({
        ...prev,
        requirements: response.requirements,
        progress: response.progress,
      }));
      setToast("Requirement marked as complete!");
    } catch (err) {
      setToast(err.message);
    }
  };

  const handleOrderAction = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadDashboard();
      setToast(`Order marked as ${status.replace("_", " ")}!`);
    } catch (err) {
      setToast(err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // Max 5MB
      if (e.target.name === "profilePhoto") {
        setProfileForm(prev => ({ ...prev, profilePhoto: URL.createObjectURL(file) }));
        // In a real app, you would upload to a secure server
        setToast("Profile photo uploaded (demo mode)!");
        handleRequirementAction("profile_photo");
      } else if (e.target.name === "idVerification") {
        setProfileForm(prev => ({ ...prev, idVerification: URL.createObjectURL(file) }));
        setToast("ID uploaded (demo mode)!");
        handleRequirementAction("id_verification");
      }
    } else {
      setToast("File too large! Max size 5MB");
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
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Technician dashboard
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Hello, {data.profile.name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Complete onboarding requirements and manage incoming jobs.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total jobs" value={data.stats.totalJobs} />
          <StatCard label="Pending" value={data.stats.pending} tone="pending" />
          <StatCard label="Active" value={data.stats.active} tone="active" />
          <StatCard label="Completed" value={data.stats.completed} tone="success" />
        </div>

        <section className="section-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-title">Verification requirements</h2>
              <p className="section-subtitle">
                Complete all required steps to become a trusted technician on TechConnect
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 px-4 py-3 text-center ring-1 ring-brand-100">
              <p className="text-2xl font-extrabold text-brand-700">{data.progress.percent}%</p>
              <p className="text-xs font-semibold text-brand-600">
                {data.progress.completedRequired}/{data.progress.totalRequired} required done
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${data.progress.percent}%` }}
            />
          </div>

          {data.progress.isVerified ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              🎉 All required verification steps completed. Your profile is ready for trusted listing!
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Finish the checklist below to unlock full visibility and trusted badge eligibility.
            </p>
          )}

          <div className="mt-5 space-y-3">
            {data.requirements.map((requirement) => (
              <div
                key={requirement.id}
                className={`rounded-xl border p-4 transition ${
                  requirement.completed
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        requirement.completed ? "bg-emerald-500" : "bg-slate-300"
                      }`} />
                      <p className={`font-semibold ${
                        requirement.completed ? "text-emerald-900" : "text-slate-900"
                      }`}>
                        {requirement.label}
                      </p>
                      {requirement.required ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
                          Required
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm ${
                      requirement.completed ? "text-emerald-700" : "text-slate-500"
                    }`}>
                      {requirement.description}
                    </p>

                    {/* Upload sections for photo and ID */}
                    {!requirement.completed && requirement.id === "profile_photo" && (
                      <div className="mt-3">
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-center">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            📷
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            Click to upload profile photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            name="profilePhoto"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {!requirement.completed && requirement.id === "id_verification" && (
                      <div className="mt-3">
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-center">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            🪪
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            Upload government ID
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            name="idVerification"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {!requirement.completed && requirement.id !== "profile_photo" && requirement.id !== "id_verification" && (
                    <button
                      onClick={() => handleRequirementAction(requirement.id)}
                      className="btn-primary px-3 py-2 text-xs"
                    >
                      Complete
                    </button>
                  )}
                  {requirement.completed && (
                    <span className="text-xs font-semibold text-emerald-600">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <section className="section-card">
            <h2 className="section-title">Assigned jobs</h2>
            <p className="section-subtitle">Accept and update status for customer bookings</p>

            {data.orders.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No jobs assigned yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {data.orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{order.service}</h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-slate-600">{order.address}</p>
                      <p className="text-xs text-slate-500">
                        Scheduled: {formatOrderDate(order.scheduledAt)}
                      </p>
                      <p className="text-lg font-extrabold text-brand-700">₹{order.price}</p>

                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleOrderAction(order.id, "accepted")}
                            className="btn-primary px-3 py-2 text-xs"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === "accepted" && (
                          <button
                            type="button"
                            onClick={() => handleOrderAction(order.id, "in_progress")}
                            className="btn-primary px-3 py-2 text-xs"
                          >
                            Start job
                          </button>
                        )}
                        {order.status === "in_progress" && (
                          <button
                            type="button"
                            onClick={() => handleOrderAction(order.id, "completed")}
                            className="btn-primary px-3 py-2 text-xs"
                          >
                            Mark completed
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="section-card">
            <h2 className="section-title">Professional profile</h2>
            <p className="section-subtitle">Service details, location, and availability</p>

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
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Primary service
                </span>
                <select
                  value={profileForm.service}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, service: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select service</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Experience</span>
                <input
                  value={profileForm.experience}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, experience: e.target.value }))
                  }
                  placeholder="e.g., 3 years"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Bio</span>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell customers about your expertise"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

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

              <div className="grid grid-cols-2 gap-3">
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
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Service radius (km)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={profileForm.serviceRadiusKm}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        serviceRadiusKm: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={profileForm.available}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, available: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm font-semibold text-slate-700">Available for new bookings</span>
              </label>

              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
