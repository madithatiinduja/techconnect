import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { findTechnicianById } from "./technicians.js";
import { haversineDistanceKm } from "../utils/distance.js";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const hashBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");
  return timingSafeEqual(hashBuffer, storedBuffer);
}

export function createToken() {
  return randomBytes(32).toString("hex");
}

export const TECHNICIAN_REQUIREMENTS = [
  {
    id: "profile_photo",
    label: "Profile photo",
    description: "Upload a clear professional photo for your public profile.",
    required: true,
  },
  {
    id: "id_verification",
    label: "ID verification",
    description: "Submit a valid government ID (Aadhaar, PAN, or driving licence).",
    required: true,
  },
  {
    id: "service_category",
    label: "Primary service",
    description: "Select the main service category you offer.",
    required: true,
  },
  {
    id: "service_area",
    label: "Service area",
    description: "Set your base location and how far you are willing to travel.",
    required: true,
  },
  {
    id: "experience",
    label: "Experience details",
    description: "Add your years of experience and a short bio.",
    required: true,
  },
  {
    id: "background_check",
    label: "Background check consent",
    description: "Agree to TechConnect verification and background screening.",
    required: true,
  },
  {
    id: "availability",
    label: "Availability schedule",
    description: "Set your weekly working hours and availability status.",
    required: true,
  },
  {
    id: "payment_details",
    label: "Payment details",
    description: "Add bank account or UPI details to receive payouts.",
    required: false,
  },
];

function defaultRequirements() {
  return TECHNICIAN_REQUIREMENTS.map((req) => ({
    ...req,
    completed: false,
  }));
}

const TRACKING_SPEED_KMPH = 22;

function generateSecurityCode() {
  const randomValue = randomBytes(2).readUInt16BE(0);
  return String(1000 + (randomValue % 9000));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolateCoordinate(start, end, progress) {
  return Number((start + (end - start) * progress).toFixed(6));
}

function getTrackingSnapshot(order) {
  if (!Number.isFinite(order.lat) || !Number.isFinite(order.lng)) {
    return null;
  }

  const startLat = Number.isFinite(order.technicianStartLat)
    ? order.technicianStartLat
    : order.lat;
  const startLng = Number.isFinite(order.technicianStartLng)
    ? order.technicianStartLng
    : order.lng;

  const totalDistanceKm = haversineDistanceKm(startLat, startLng, order.lat, order.lng);
  const totalEtaMinutes = Math.max(6, Math.round((totalDistanceKm / TRACKING_SPEED_KMPH) * 60));

  if (order.status === "cancelled") {
    return {
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      remainingDistanceKm: Number(totalDistanceKm.toFixed(2)),
      etaMinutes: null,
      progressPercent: 0,
      currentLat: startLat,
      currentLng: startLng,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
  );
  const rawProgress = totalEtaMinutes === 0 ? 1 : elapsedMinutes / totalEtaMinutes;
  const progress =
    order.status === "completed"
      ? 1
      : clamp(rawProgress === 0 ? 0.08 : rawProgress, 0.08, 0.96);
  const currentLat = interpolateCoordinate(startLat, order.lat, progress);
  const currentLng = interpolateCoordinate(startLng, order.lng, progress);
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

const users = [
  {
    id: "user-client-1",
    roles: ["client"],
    name: "Ananya",
    email: "client@techconnect.com",
    password: hashPassword("client123"),
    phone: "+91 98765 43210",
    address: "Brodipet, Guntur, Andhra Pradesh",
    lat: 16.2322,
    lng: 80.5536,
    city: "Guntur",
    technicianId: null,
    service: "",
    experience: "",
    bio: "",
    available: false,
    serviceRadiusKm: 5,
    requirements: null,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "user-tech-1",
    roles: ["client", "technician"],
    name: "Venkata Sai",
    email: "tech@techconnect.com",
    password: hashPassword("tech123"),
    phone: "+91 91234 56789",
    address: "Arundelpet, Guntur, Andhra Pradesh",
    lat: 16.235,
    lng: 80.551,
    city: "Guntur",
    technicianId: 1,
    service: "AC Repair",
    experience: "6 years",
    bio: "Certified AC technician serving Arundelpet and nearby Guntur areas.",
    available: true,
    serviceRadiusKm: 10,
    requirements: defaultRequirements().map((req) =>
      ["profile_photo", "service_category", "service_area", "experience"].includes(req.id)
        ? { ...req, completed: true }
        : req
    ),
    createdAt: "2026-01-10T10:00:00.000Z",
  },
];

const orders = [];

const sessions = new Map();

export const store = {
  users,
  orders,
  sessions,
};

export function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export function findUserByEmail(email) {
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return store.users.find((user) => user.id === id);
}

export function findSession(token) {
  return store.sessions.get(token);
}

export function findOrderById(id) {
  return store.orders.find((order) => order.id === id);
}

function normalizeOrderAddress(address) {
  return String(address || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeScheduledAt(value) {
  if (!value) return "";
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? "" : new Date(time).toISOString();
}

function isDuplicatePendingOrder(order, payload) {
  return (
    order.status === "pending" &&
    order.clientId === payload.clientId &&
    order.technicianId === payload.technicianId &&
    order.service === payload.service &&
    normalizeOrderAddress(order.address) === normalizeOrderAddress(payload.address) &&
    normalizeScheduledAt(order.scheduledAt) === normalizeScheduledAt(payload.scheduledAt)
  );
}

export function getOrderView(order) {
  if (!order) return null;

  const technician = findTechnicianById(order.technicianId);

  return {
    ...order,
    securityCode: order.securityCode || generateSecurityCode(),
    technicianPhone: order.technicianPhone || technician?.phone || "",
    tracking: getTrackingSnapshot(order),
    technician: technician
      ? {
          id: technician.id,
          name: technician.name,
          service: technician.service,
          rating: technician.rating,
          image: technician.image,
          phone: technician.phone,
          city: technician.city,
        }
      : null,
  };
}

export function createUser(payload) {
  // Accept either single role or array of roles
  const roles = Array.isArray(payload.role) ? payload.role : [payload.role];
  
  const user = {
    id: `user-${Date.now()}`,
    roles,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: hashPassword(payload.password),
    phone: payload.phone?.trim() || "",
    address: payload.address?.trim() || "",
    lat: payload.lat ?? null,
    lng: payload.lng ?? null,
    city: payload.city?.trim() || "",
    technicianId: null,
    service: "",
    experience: "",
    bio: "",
    available: false,
    serviceRadiusKm: 5,
    requirements: null,
    createdAt: new Date().toISOString(),
  };

  // Add technician fields if technician role is present
  if (roles.includes("technician")) {
    user.technicianId = Date.now();
    user.service = payload.service || "";
    user.experience = payload.experience || "";
    user.bio = "";
    user.available = true;
    user.serviceRadiusKm = 5;
    user.requirements = defaultRequirements();
  }

  store.users.push(user);
  return user;
}

export function createOrder(payload) {
  const technician = findTechnicianById(payload.technicianId);
  const existingPendingOrder = store.orders.find((order) =>
    isDuplicatePendingOrder(order, payload)
  );

  if (existingPendingOrder) {
    return existingPendingOrder;
  }

  const order = {
    id: `order-${Date.now()}`,
    clientId: payload.clientId,
    technicianId: payload.technicianId,
    technicianName: payload.technicianName,
    service: payload.service,
    status: "pending",
    price: payload.price,
    address: payload.address,
    lat: payload.lat,
    lng: payload.lng,
    securityCode: generateSecurityCode(),
    technicianPhone: payload.technicianPhone || technician?.phone || "",
    technicianStartLat: technician?.lat ?? payload.lat,
    technicianStartLng: technician?.lng ?? payload.lng,
    scheduledAt: payload.scheduledAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  store.orders.push(order);
  return order;
}

export function removeDuplicatePendingOrders() {
  const seen = new Set();
  const uniqueOrders = [];

  const sortedOrders = [...store.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const order of sortedOrders) {
    if (order.status !== "pending") {
      uniqueOrders.push(order);
      continue;
    }

    const key = [
      order.clientId,
      order.technicianId,
      order.service,
      normalizeOrderAddress(order.address),
      normalizeScheduledAt(order.scheduledAt),
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueOrders.push(order);
  }

  store.orders.length = 0;
  store.orders.push(
    ...uniqueOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );

  return store.orders;
}

export function getTechnicianRequirements(user) {
  if (!user.requirements) {
    user.requirements = defaultRequirements();
  }
  
  // Auto-mark requirements based on user profile data
  user.requirements = user.requirements.map(req => {
    let autoCompleted = req.completed;
    
    if (req.id === "service_category") {
      autoCompleted = user.service && user.service.trim().length > 0;
    }
    if (req.id === "service_area") {
      autoCompleted = user.address && user.address.trim().length > 0 && user.city && user.city.trim().length > 0 && user.lat !== null && user.lng !== null;
    }
    if (req.id === "experience") {
      autoCompleted = user.experience && user.experience.trim().length > 0 && user.bio && user.bio.trim().length > 0;
    }
    if (req.id === "availability") {
      autoCompleted = user.available !== undefined;
    }
    
    return { ...req, completed: autoCompleted };
  });
  
  return user.requirements;
}

export function getRequirementsProgress(requirements) {
  const required = requirements.filter((item) => item.required);
  const completedRequired = required.filter((item) => item.completed).length;
  const totalRequired = required.length;
  const percent = totalRequired
    ? Math.round((completedRequired / totalRequired) * 100)
    : 0;

  return {
    completedRequired,
    totalRequired,
    percent,
    isVerified: completedRequired === totalRequired,
  };
}
