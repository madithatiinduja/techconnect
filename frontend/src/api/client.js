const API_BASE = "https://techconnect-zxoo.onrender.com/api";;
const TOKEN_KEY = "techconnect_token";
const SECURITY_CODE_PREFIX = "techconnect_security_code_";
const TRACKING_SPEED_KMPH = 22;
const FALLBACK_RADIUS_KM = 50;

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function getSecurityCode(orderId) {
  const storageKey = `${SECURITY_CODE_PREFIX}${orderId}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  let hash = 0;
  for (const char of String(orderId)) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9000;
  }
  const generated = String(1000 + hash).padStart(4, "0");
  localStorage.setItem(storageKey, generated);
  return generated;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

function interpolateCoordinate(start, end, progress) {
  return Number((start + (end - start) * progress).toFixed(6));
}

function buildTracking(order, technician) {
  if (
    !technician ||
    !Number.isFinite(order?.lat) ||
    !Number.isFinite(order?.lng) ||
    !Number.isFinite(technician?.lat) ||
    !Number.isFinite(technician?.lng)
  ) {
    return null;
  }

  const totalDistanceKm = haversineDistanceKm(technician.lat, technician.lng, order.lat, order.lng);
  const totalEtaMinutes = Math.max(6, Math.round((totalDistanceKm / TRACKING_SPEED_KMPH) * 60));

  if (order.status === "cancelled") {
    return {
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      remainingDistanceKm: Number(totalDistanceKm.toFixed(2)),
      etaMinutes: null,
      progressPercent: 0,
      currentLat: technician.lat,
      currentLng: technician.lng,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  const statusStart =
    order.status === "completed"
      ? order.completedAt || order.createdAt
      : order.status === "in_progress"
        ? order.startedAt || order.acceptedAt || order.createdAt
        : order.status === "accepted"
          ? order.acceptedAt || order.createdAt
          : order.createdAt;

  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(statusStart).getTime()) / 60000)
  );

  const baselineProgress = {
    pending: 0.08,
    accepted: 0.32,
    in_progress: 0.5,
    completed: 1,
  };

  const statusBase = baselineProgress[order.status] ?? 0.08;
  const progress =
    order.status === "completed"
      ? 1
      : clamp(statusBase + elapsedMinutes / (totalEtaMinutes * 1.6), 0.08, 0.96);

  const currentLat = interpolateCoordinate(technician.lat, order.lat, progress);
  const currentLng = interpolateCoordinate(technician.lng, order.lng, progress);
  const remainingDistanceKm =
    order.status === "completed"
      ? 0
      : haversineDistanceKm(currentLat, currentLng, order.lat, order.lng);
  const etaMinutes =
    order.status === "completed"
      ? 0
      : Math.max(1, Math.ceil((remainingDistanceKm / TRACKING_SPEED_KMPH) * 60));

  return {
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    remainingDistanceKm: Number(remainingDistanceKm.toFixed(2)),
    etaMinutes,
    progressPercent: Math.round(progress * 100),
    currentLat,
    currentLng,
    lastUpdatedAt: new Date().toISOString(),
  };
}

function enrichOrder(order, technician) {
  const safeTechnician = technician || null;
  return {
    ...order,
    technicianPhone: order.technicianPhone || safeTechnician?.phone || "",
    securityCode: order.securityCode || getSecurityCode(order.id),
    technician: safeTechnician
      ? {
          id: safeTechnician.id,
          name: safeTechnician.name,
          service: safeTechnician.service,
          rating: safeTechnician.rating,
          image: safeTechnician.image,
          phone: safeTechnician.phone,
          city: safeTechnician.city,
          lat: safeTechnician.lat,
          lng: safeTechnician.lng,
        }
      : null,
    tracking: order.tracking || buildTracking(order, safeTechnician),
  };
}

export async function fetchServices() {
  return request("/services");
}

export async function fetchTechnicians({ lat, lng, radius, service, trustedOnly }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });

  if (service) params.set("service", service);
  if (trustedOnly) params.set("trusted", "true");

  const res = await fetch(`${API_BASE}/technicians?${params}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Failed to load technicians");
  }

  return data;
}

export async function fetchTechnicianById(technicianId, { lat, lng } = {}) {
  const params = new URLSearchParams();
  if (lat !== undefined && lat !== null) params.set("lat", String(lat));
  if (lng !== undefined && lng !== null) params.set("lng", String(lng));

  const suffix = params.toString() ? `?${params}` : "";
  try {
    return await request(`/technicians/${technicianId}${suffix}`);
  } catch (error) {
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      throw error;
    }

    const fallback = await fetchTechnicians({
      lat,
      lng,
      radius: FALLBACK_RADIUS_KM,
      service: "",
      trustedOnly: false,
    });
    const technician = fallback.technicians.find(
      (item) => Number(item.id) === Number(technicianId)
    );

    if (!technician) {
      throw error;
    }

    return { technician };
  }
}

export async function login({ email, username, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

export async function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return request("/auth/logout", { method: "POST" });
}

export async function fetchMe() {
  return request("/auth/me");
}

export async function createOrder(payload) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOrderById(orderId) {
  try {
    return await request(`/orders/${orderId}`);
  } catch (error) {
    const dashboard = await fetchClientDashboard();
    const order = dashboard.orders.find((item) => item.id === orderId);

    if (!order) {
      throw error;
    }

    let technician = null;
    try {
      const technicianResponse = await fetchTechnicianById(order.technicianId, {
        lat: order.lat,
        lng: order.lng,
      });
      technician = technicianResponse.technician;
    } catch {
      technician = null;
    }

    return { order: enrichOrder(order, technician) };
  }
}

export async function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function acceptOrderPayment(orderId) {
  return request(`/orders/${orderId}/payment`, {
    method: "PATCH",
  });
}

export async function markPaymentSubmitted(orderId) {
  return request(`/orders/${orderId}/payment-submitted`, {
    method: "PATCH",
  });
}

export async function fetchClientDashboard() {
  return request("/dashboard/client");
}

export async function updateClientProfile(payload) {
  return request("/dashboard/client", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchTechnicianDashboard() {
  return request("/dashboard/technician");
}

export async function fetchAdminDashboard() {
  return request("/dashboard/admin");
}

export async function updateTechnicianProfile(payload) {
  return request("/dashboard/technician", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
