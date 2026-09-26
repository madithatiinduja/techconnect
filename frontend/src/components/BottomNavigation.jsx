import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ICONS = {
  home: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  bookings: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  profile: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export default function BottomNavigation() {
  const { user, isClient, isTechnician, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = isAdmin
    ? [
        {
          path: "/dashboard/admin",
          label: "Admin",
          icon: ICONS.bookings,
        },
        {
          path: "/profile",
          label: "Profile",
          icon: ICONS.profile,
        },
      ]
    : [
        {
          path: "/",
          label: "Home",
          icon: ICONS.home,
        },
        {
          path: isClient ? "/dashboard/client" : "/dashboard/technician",
          label: "Bookings",
          icon: ICONS.bookings,
        },
        {
          path: "/profile",
          label: "Profile",
          icon: ICONS.profile,
        },
      ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/80 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition ${
              isActive(item.path)
                ? "text-brand-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold sm:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
