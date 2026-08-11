import { useAuth } from "../context/AuthContext.jsx";
import Header from "../components/Header.jsx";
import BottomNavigation from "../components/BottomNavigation.jsx";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell min-h-screen min-h-[100dvh]">
      <Header />
      <main className="mx-auto w-full max-w-md px-3 py-6 pb-24 sm:px-6 sm:py-8">
        <div className="section-card">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-2xl font-extrabold text-white shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles?.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {user.phone || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">City</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {user.city || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Address</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {user.address || "Not provided"}
              </p>
            </div>

            {user.service && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Service</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {user.service}
                </p>
              </div>
            )}

            {user.experience && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Experience</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {user.experience}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="btn-secondary mt-6 w-full border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
