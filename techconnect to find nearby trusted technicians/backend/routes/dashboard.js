import { Router } from "express";
import {
  findUserById,
  getRequirementsProgress,
  getOrderView,
  getTechnicianRequirements,
  removeDuplicatePendingOrders,
  sanitizeUser,
  store,
} from "../data/store.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/client", requireRole("client"), (req, res) => {
  removeDuplicatePendingOrders();
  const user = findUserById(req.user.id);
  const orders = store.orders
    .filter((order) => order.clientId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((order) => getOrderView(order));

  res.json({
    profile: sanitizeUser(user),
    location: {
      address: user.address,
      city: user.city,
      lat: user.lat,
      lng: user.lng,
    },
    orders,
    stats: {
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      inProgress: orders.filter((order) =>
        ["accepted", "in_progress"].includes(order.status)
      ).length,
      completed: orders.filter((order) => order.status === "completed").length,
    },
  });
});

router.patch("/client", requireRole("client"), (req, res) => {
  const user = findUserById(req.user.id);
  const { name, phone, address, city, lat, lng } = req.body;

  if (name?.trim()) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (address !== undefined) user.address = address.trim();
  if (city !== undefined) user.city = city.trim();
  if (lat !== undefined) user.lat = lat;
  if (lng !== undefined) user.lng = lng;

  res.json({
    profile: sanitizeUser(user),
    location: {
      address: user.address,
      city: user.city,
      lat: user.lat,
      lng: user.lng,
    },
  });
});

router.get("/technician", requireRole("technician"), (req, res) => {
  removeDuplicatePendingOrders();
  const user = findUserById(req.user.id);
  const requirements = getTechnicianRequirements(user);
  const progress = getRequirementsProgress(requirements);
  const orders = store.orders
    .filter((order) => order.technicianId === user.technicianId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((order) => getOrderView(order));

  res.json({
    profile: sanitizeUser(user),
    location: {
      address: user.address,
      city: user.city,
      lat: user.lat,
      lng: user.lng,
      serviceRadiusKm: user.serviceRadiusKm,
    },
    requirements,
    progress,
    orders,
    stats: {
      totalJobs: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      active: orders.filter((order) =>
        ["accepted", "in_progress"].includes(order.status)
      ).length,
      completed: orders.filter((order) => order.status === "completed").length,
    },
  });
});

router.patch("/technician", requireRole("technician"), (req, res) => {
  const user = findUserById(req.user.id);
  const {
    name,
    phone,
    address,
    city,
    lat,
    lng,
    service,
    experience,
    bio,
    available,
    serviceRadiusKm,
    requirementId,
    completed,
  } = req.body;

  if (name?.trim()) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (address !== undefined) user.address = address.trim();
  if (city !== undefined) user.city = city.trim();
  if (lat !== undefined) user.lat = lat;
  if (lng !== undefined) user.lng = lng;
  if (service !== undefined) user.service = service.trim();
  if (experience !== undefined) user.experience = experience.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (available !== undefined) user.available = Boolean(available);
  if (serviceRadiusKm !== undefined) user.serviceRadiusKm = Number(serviceRadiusKm);

  const requirements = getTechnicianRequirements(user);

  if (requirementId) {
    const requirement = requirements.find((item) => item.id === requirementId);
    if (!requirement) {
      return res.status(404).json({ error: "Requirement not found" });
    }
    requirement.completed = Boolean(completed);
  }

  const progress = getRequirementsProgress(requirements);

  res.json({
    profile: sanitizeUser(user),
    location: {
      address: user.address,
      city: user.city,
      lat: user.lat,
      lng: user.lng,
      serviceRadiusKm: user.serviceRadiusKm,
    },
    requirements,
    progress,
  });
});

export default router;
