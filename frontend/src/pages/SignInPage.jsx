import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "../components/Header.jsx";

export default function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email: identifier, username: identifier, password });
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (user.roles?.includes("admin")) {
        navigate("/dashboard/admin", { replace: true });
      } else if (user.roles?.includes("technician")) {
        navigate("/dashboard/technician", { replace: true });
      } else {
        navigate("/dashboard/client", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen min-h-[100dvh] bg-[#f4f0ed]">
      <Header />

      <main className="mx-auto flex w-full max-w-md flex-col px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full rounded-[28px] bg-[#f9f7f5] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-black text-white">
              {identifier ? identifier.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {identifier || "Username or email"}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-4 text-lg text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
                placeholder="Username or email"
              />
            </label>

            <label className="block">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl border bg-transparent px-4 py-4 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                  error
                    ? "border-red-500 text-red-700"
                    : "border-slate-300 focus:border-brand-500"
                }`}
                placeholder="Enter your password"
              />
            </label>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
                  !
                </span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-center">
              <button type="submit" disabled={loading} className="btn-primary w-full rounded-2xl py-3 text-base">
                {loading ? "Signing in..." : "Continue"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-[28px] font-black italic text-red-500/75 tracking-[-0.05em]">
            welcome
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/60 p-4 text-left text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Demo accounts</p>
            <div className="mt-3 space-y-2">
              <p><span className="font-semibold text-slate-800">Admin:</span> admin / admin124</p>
              <p><span className="font-semibold text-slate-800">Client:</span> client@techconnect.com / client123</p>
              <p><span className="font-semibold text-slate-800">Technician:</span> tech@techconnect.com / tech123</p>
            </div>
          </div>

          <p className="mt-7 text-center text-base leading-relaxed text-slate-600">
            Before using this app, you can review <span className="font-semibold text-brand-600">base44.com&apos;s</span> Privacy Policy and Terms of Service.
          </p>

          <div className="mt-6 flex justify-center">
            <Link to="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
