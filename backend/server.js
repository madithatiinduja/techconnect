import cors from "cors";
import express from "express";
import { findTechnicianById, technicians, services } from "./data/technicians.js";
import { haversineDistanceKm } from "./utils/distance.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import { store } from "./data/store.js";

const app = express();
const PORT = process.env.PORT || 5000;

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "TechConnect API" });
});

app.get("/api/services", (_req, res) => {
  res.json(services);
});

app.get("/api/technicians", (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = parseFloat(req.query.radius) || 5;
  const service = req.query.service;
  const trustedOnly = req.query.trusted === "true";

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({
      error: "lat and lng query parameters are required",
    });
  }

  const registeredTechnicians = store.users
    .filter((user) => user.roles?.includes("technician") && user.service)
    .map((user) => ({
      id: user.technicianId || user.id,
      name: user.name,
      service: user.service,
      rating: 4.8,
      reviews: 0,
      trusted: Boolean(
        user.requirements?.every((requirement) => requirement.completed)
      ),
      experience: user.experience || "New",
      price: 499,
      lat: Number.isFinite(user.lat) ? user.lat : 16.2322,
      lng: Number.isFinite(user.lng) ? user.lng : 80.5536,
      city: user.city || "Guntur",
      phone: user.phone || "",
      available: user.available !== false,
      image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
    }));

  const combinedTechnicians = [
    ...technicians,
    ...registeredTechnicians.filter(
      (registered) =>
        !technicians.some(
          (seeded) =>
            Number(seeded.id) === Number(registered.id) ||
            seeded.name.toLowerCase() === registered.name.toLowerCase()
        )
    ),
  ];

  let results = combinedTechnicians.map((tech) => ({
    ...tech,
    distanceKm: Number(
      haversineDistanceKm(lat, lng, tech.lat, tech.lng).toFixed(2)
    ),
  }));

  if (service) {
    results = results.filter((tech) => tech.service === service);
  }

  if (trustedOnly) {
    results = results.filter((tech) => tech.trusted);
  }

  results = results
    .filter((tech) => tech.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (results.length === 0 && !service && !trustedOnly) {
    results = combinedTechnicians
      .map((tech) => ({
        ...tech,
        distanceKm: Number(
          haversineDistanceKm(lat, lng, tech.lat, tech.lng).toFixed(2)
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 13);
  }

  res.json({
    userLocation: { lat, lng },
    radiusKm,
    count: results.length,
    technicians: results,
  });
});

app.get("/api/technicians/:id", (req, res) => {
  const registeredTechnician = store.users
    .filter((user) => user.roles?.includes("technician") && user.service)
    .find((user) => String(user.technicianId || user.id) === String(req.params.id));
  const technician = registeredTechnician
    ? {
        id: registeredTechnician.technicianId || registeredTechnician.id,
        name: registeredTechnician.name,
        service: registeredTechnician.service,
        rating: 4.8,
        reviews: 0,
        trusted: Boolean(
          registeredTechnician.requirements?.every((requirement) => requirement.completed)
        ),
        experience: registeredTechnician.experience || "New",
        price: 499,
        lat: registeredTechnician.lat ?? 16.2322,
        lng: registeredTechnician.lng ?? 80.5536,
        city: registeredTechnician.city || "Guntur",
        phone: registeredTechnician.phone || "",
        available: registeredTechnician.available !== false,
        image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(registeredTechnician.name)}`,
      }
    : findTechnicianById(req.params.id);
  if (!technician) {
    return res.status(404).json({ error: "Technician not found" });
  }

  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const distanceKm =
    Number.isNaN(lat) || Number.isNaN(lng)
      ? null
      : Number(haversineDistanceKm(lat, lng, technician.lat, technician.lng).toFixed(2));

  res.json({
    technician: {
      ...technician,
      distanceKm,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`TechConnect API running on http://localhost:${PORT}`);
});
