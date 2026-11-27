import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
  { id: "profile_photo", label: "Profile photo", description: "Upload a clear professional photo for your public profile.", required: true },
  { id: "id_verification", label: "ID verification", description: "Submit a valid government ID (Aadhaar, PAN, or driving licence).", required: true },
  { id: "service_category", label: "Primary service", description: "Select the main service category you offer.", required: true },
  { id: "service_area", label: "Service area", description: "Set your base location and how far you are willing to travel.", required: true },
  { id: "experience", label: "Experience details", description: "Add your years of experience and a short bio.", required: true },
  { id: "background_check", label: "Background check consent", description: "Agree to TechConnect verification and background screening.", required: true },
  { id: "availability", label: "Availability schedule", description: "Set your weekly working hours and availability status.", required: true },
  { id: "payment_details", label: "Payment details", description: "Add bank account or UPI details to receive payouts.", required: false },
];

function defaultRequirements() {
  return TECHNICIAN_REQUIREMENTS.map((req) => ({ ...req, completed: false }));
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

  const startLat = Number.isFinite(order.technicianStartLat) ? order.technicianStartLat : order.lat;
  const startLng = Number.isFinite(order.technicianStartLng) ? order.technicianStartLng : order.lng;
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

  const statusStart =
    order.status === "completed"
      ? order.completedAt || order.createdAt
      : order.status === "in_progress"
        ? order.startedAt || order.acceptedAt || order.createdAt
        : order.status === "accepted"
          ? order.acceptedAt || order.createdAt
          : order.createdAt;

  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(statusStart).getTime()) / 60000));
  const baselineProgress = { pending: 0.08, accepted: 0.32, in_progress: 0.5, completed: 1 };
  const statusBase = baselineProgress[order.status] ?? 0.08;
  const progress =
    order.status === "completed"
      ? 1
      : clamp(statusBase + elapsedMinutes / (totalEtaMinutes * 1.6), 0.08, 0.96);

  const currentLat = interpolateCoordinate(startLat, order.lat, progress);
  const currentLng = interpolateCoordinate(startLng, order.lng, progress);
  const remainingDistanceKm = order.status === "completed" ? 0 : haversineDistanceKm(currentLat, currentLng, order.lat, order.lng);
  const etaMinutes = order.status === "completed" ? 0 : Math.max(1, Math.ceil((remainingDistanceKm / TRACKING_SPEED_KMPH) * 60));

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "db.json");

function defaultUsers() {
  return [
    {
      id: "user-admin-1",
      roles: ["admin"],
      name: "Admin Console",
      username: "admin",
      email: "admin@techconnect.com",
      password: hashPassword("admin124"),
      phone: "+91 90000 00000",
      address: "Head Office, Guntur",
      lat: 16.31,
      lng: 80.435,
      city: "Guntur",
      technicianId: null,
      service: "",
      experience: "",
      bio: "Platform administrator for operations and trust management.",
      available: false,
      serviceRadiusKm: 0,
      requirements: null,
      createdAt: "2026-01-05T09:00:00.000Z",
    },
    {
      id: "user-client-1",
      roles: ["client"],
      name: "Ananya",
      username: "client",
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
      username: "tech",
      email: "tech@techconnect.com",
      password: hashPassword("tech123"),
      phone: "+91 91234 56789",
      address: "Arundelpet, Guntur, Andhra Pradesh",
      lat: 16.235,
      lng: 80.551,
      city: "Guntur",
      technicianId: "tech-1",
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
}

function defaultState() {
  return { users: defaultUsers(), orders: [], sessions: {} };
}

function writeState(stateToWrite) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(stateToWrite, null, 2), "utf8");
}

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const fresh = defaultState();
      writeState(fresh);
      return fresh;
    }

    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw || "{}");

    return {
      users: Array.isArray(parsed.users) ? parsed.users : defaultUsers(),
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      sessions: parsed.sessions && typeof parsed.sessions === "object" ? parsed.sessions : {},
    };
  } catch {
    const fresh = defaultState();
    writeState(fresh);
    return fresh;
  }
}

const state = readState();

export const store = {
  users: state.users,
  orders: state.orders,
  sessions: new Map(Object.entries(state.sessions || {})),
};

export function persistStore() {
  writeState({
    users: store.users,
    orders: store.orders,
    sessions: Object.fromEntries(store.sessions.entries()),
  });
}

export function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export function saveSession(token, userId) {
  const createdAt = new Date().toISOString();
  store.sessions.set(token, { userId, createdAt });
  persistStore();
  return { token, userId, createdAt };
}

export function removeSession(token) {
  store.sessions.delete(token);
  persistStore();
}

export function findUserByEmail(email) {
  if (!email) return undefined;
  return store.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
}

export function findUserByUsername(username) {
  if (!username) return undefined;
  return store.users.find((user) => user.username?.toLowerCase() === username.toLowerCase());
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
  return String(address || "").trim().toLowerCase().replace(/\s+/g, " ");
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
    payment: {
      method: order.paymentMethod || "cash",
      status: order.paymentStatus || "paid",
      amount: Number(order.price) || 0,
      paidAt: order.paidAt || order.createdAt,
      submittedAt: order.paymentSubmittedAt || null,
    },
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
  const roles = Array.isArray(payload.role) ? payload.role : [payload.role];
  const user = {
    id: `user-${Date.now()}`,
    roles,
    name: payload.name.trim(),
    username: payload.username?.trim().toLowerCase() || "",
    email: payload.email?.trim().toLowerCase() || "",
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

  if (roles.includes("technician")) {
    user.technicianId = String(Date.now());
    user.service = payload.service || "";
    user.experience = payload.experience || "";
    user.bio = "";
    user.available = true;
    user.serviceRadiusKm = 5;
    user.requirements = defaultRequirements();
  }

  store.users.push(user);
  persistStore();
  return user;
}

export function createOrder(payload) {
  const technician = findTechnicianById(payload.technicianId);
  const existingPendingOrder = store.orders.find((order) => isDuplicatePendingOrder(order, payload));

  if (existingPendingOrder) {
    return existingPendingOrder;
  }

  const paymentMethod = payload.paymentMethod || "cash";
  const paymentStatus = payload.paymentStatus || (paymentMethod === "cash" ? "pending" : "paid");

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
    paymentMethod,
    paymentStatus,
    paidAt: paymentStatus === "paid" ? new Date().toISOString() : null,
    paymentSubmittedAt: null,
    securityCode: generateSecurityCode(),
    technicianPhone: payload.technicianPhone || technician?.phone || "",
    technicianStartLat: technician?.lat ?? payload.lat,
    technicianStartLng: technician?.lng ?? payload.lng,
    scheduledAt: payload.scheduledAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    acceptedAt: null,
    startedAt: null,
  };

  store.orders.push(order);
  persistStore();
  return order;
}

export function removeDuplicatePendingOrders() {
  const seen = new Set();
  const uniqueOrders = [];
  const sortedOrders = [...store.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
  store.orders.push(...uniqueOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  persistStore();
  return store.orders;
}

export function getTechnicianRequirements(user) {
  if (!user.requirements) {
    user.requirements = defaultRequirements();
  }

  user.requirements = user.requirements.map((req) => {
    let autoCompleted = req.completed;

    if (req.id === "service_category") {
      autoCompleted = Boolean(user.service && user.service.trim().length > 0);
    }
    if (req.id === "service_area") {
      autoCompleted = Boolean(
        user.address &&
          user.address.trim().length > 0 &&
          user.city &&
          user.city.trim().length > 0 &&
          user.lat !== null &&
          user.lng !== null
      );
    }
    if (req.id === "experience") {
      autoCompleted = Boolean(
        user.experience && user.experience.trim().length > 0 && user.bio && user.bio.trim().length > 0
      );
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
  const percent = totalRequired ? Math.round((completedRequired / totalRequired) * 100) : 0;

  return {
    completedRequired,
    totalRequired,
    percent,
    isVerified: completedRequired === totalRequired,
  };
}
