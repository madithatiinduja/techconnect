import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchTechnicians } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "../components/Header.jsx";
import BottomNavigation from "../components/BottomNavigation.jsx";
import Hero from "../components/Hero.jsx";
import ServiceCategories from "../components/ServiceCategories.jsx";
import LocationRadiusPanel from "../components/LocationRadiusPanel.jsx";
import TechnicianList from "../components/TechnicianList.jsx";
import Toast from "../components/Toast.jsx";

const DEFAULT_LOCATION = { lat: 16.2322, lng: 80.5536 };
const DEFAULT_RADIUS = 5;

export default function HomePage() {
  const { user, isClient } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in your browser.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
        setError("");
      },
      () => {
        setLoadingLocation(false);
        setError("Could not get your location. Using default coordinates.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  const loadTechnicians = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchTechnicians({
        lat: location.lat,
        lng: location.lng,
        radius,
        service,
        trustedOnly,
      });
      setTechnicians(data.technicians);
    } catch (err) {
      setTechnicians([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location, radius, service, trustedOnly]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleClearFilter = () => {
    setService(null);
    setRadius(DEFAULT_RADIUS);
    setTrustedOnly(false);
  };

  const handleBook = (technician) => {
    if (!user) {
      navigate("/signin", { state: { from: "/" } });
      return;
    }

    if (!isClient) {
      setToast("Sign in with a client account to book technicians.");
      return;
    }

    navigate(
      `/booking/technician/${technician.id}?lat=${location.lat}&lng=${location.lng}`
    );
  };

  const hasActiveFilter =
    service !== null || radius !== DEFAULT_RADIUS || trustedOnly;

  return (
    <div className="app-shell min-h-screen min-h-[100dvh]">
      <Header />
      <Toast message={toast} onDismiss={() => setToast("")} />

      <main className="mx-auto w-full max-w-7xl space-y-4 px-3 py-5 pb-24 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Hero />

        <ServiceCategories selectedService={service} onSelectService={setService} />

        <LocationRadiusPanel
          location={location}
          radius={radius}
          loadingLocation={loadingLocation}
          onUpdateLocation={updateLocation}
          onRadiusChange={setRadius}
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3.5 shadow-card backdrop-blur-sm transition hover:border-brand-200 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4">
          <div className="relative shrink-0">
            <input
              type="checkbox"
              checked={trustedOnly}
              onChange={(e) => setTrustedOnly(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-brand-600" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">
              Trusted & verified only
            </span>
            <span className="text-xs text-slate-500">
              Show technicians with verified background checks
            </span>
          </div>
        </label>

        <TechnicianList
          technicians={technicians}
          loading={loading}
          error={error}
          onBook={handleBook}
          onClearFilter={handleClearFilter}
          hasActiveFilter={hasActiveFilter}
        />
      </main>

      <footer className="mt-10 border-t border-slate-200/80 bg-white/60 py-6 backdrop-blur-sm sm:mt-16 sm:py-8">
        <div className="mx-auto max-w-7xl px-3 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-slate-700">TechConnect</p>
          <p className="mt-1 text-xs text-slate-500">© 2026 TechConnect. All rights reserved.</p>
        </div>
      </footer>
      <BottomNavigation />
    </div>
  );
}
