import cors from "cors";
import express from "express";
import { findTechnicianById, technicians, services } from "./data/technicians.js";
import { haversineDistanceKm } from "./utils/distance.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

  let results = technicians.map((tech) => ({
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

  res.json({
    userLocation: { lat, lng },
    radiusKm,
    count: results.length,
    technicians: results,
  });
});

app.get("/api/technicians/:id", (req, res) => {
  const technician = findTechnicianById(req.params.id);
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
