import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, logout, isClient, isTechnician, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-base font-extrabold text-white shadow-glow sm:h-11 sm:w-11 sm:rounded-2xl sm:text-lg">
            T
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 sm:h-3 sm:w-3" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              TechConnect
            </h1>
            <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
              Trusted technicians, nearby
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Show role switcher if user has both roles */}
              {(isClient && isTechnician) && (
                <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 sm:flex">
                  <Link
                    to="/dashboard/client"
                    className={({ isActive }) =>
                      `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "bg-brand-600 text-white"
                          : "text-slate-700 hover:bg-slate-200"
                      }`
                    }
                  >
                    Client
                  </Link>
                  <Link
                    to="/dashboard/technician"
                    className={({ isActive }) =>
                      `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "bg-brand-600 text-white"
                          : "text-slate-700 hover:bg-slate-200"
                      }`
                    }
                  >
                    Technician
                  </Link>
                </div>
              )}
              {!(isClient && isTechnician) && !isAdmin && (
                <Link
                  to={isTechnician ? "/dashboard/technician" : "/dashboard/client"}
                  className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/dashboard/admin"
                  className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                >
                  Admin dashboard
                </Link>
              )}
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 sm:flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[10px] font-medium capitalize text-slate-500">
                    {user.roles?.join(" / ")}
                  </p>
                </div>
              </div>
              <button type="button" onClick={logout} className="btn-secondary px-3 py-2 text-xs sm:text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-secondary px-3 py-2 text-xs sm:text-sm">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm">
                Sign up
              </Link>
            </>
          )}

          {!user && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:hidden">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
