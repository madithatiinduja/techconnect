import { Router } from "express";
import { findTechnicianById } from "../data/technicians.js";
import {
  createOrder,
  findOrderById,
  findUserById,
  getOrderView,
  removeDuplicatePendingOrders,
  store,
} from "../data/store.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res) => {
  removeDuplicatePendingOrders();
  let results = [];

  if (req.user.roles?.includes("client")) {
    results = store.orders
      .filter((order) => order.clientId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (req.user.roles?.includes("technician")) {
    results = store.orders
      .filter((order) => order.technicianId === req.user.technicianId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({ orders: results.map((order) => getOrderView(order)) });
});

router.get("/:id", (req, res) => {
  removeDuplicatePendingOrders();
  const order = findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const isClient = req.user.roles?.includes("client") && order.clientId === req.user.id;
  const isTechnician =
    req.user.roles?.includes("technician") && order.technicianId === req.user.technicianId;

  if (!isClient && !isTechnician) {
    return res.status(403).json({ error: "You cannot view this order" });
  }

  res.json({ order: getOrderView(order) });
});

router.post("/", requireRole("client"), (req, res) => {
  removeDuplicatePendingOrders();
  const {
    technicianId,
    service,
    price,
    address,
    lat,
    lng,
    scheduledAt,
    paymentMethod,
    paymentStatus,
  } = req.body;
  const client = findUserById(req.user.id);

  if (!technicianId || !service) {
    return res.status(400).json({ error: "Technician and service are required" });
  }

  const technician = findTechnicianById(technicianId);
  if (!technician) {
    return res.status(404).json({ error: "Technician not found" });
  }

  const paymentMethodValue = paymentMethod || "cash";
  const paymentStatusValue = "pending";

  const order = createOrder({
    clientId: client.id,
    technicianId: technician.id,
    technicianName: technician.name,
    service,
    price: price ?? technician.price,
    address: address || client.address,
    lat: lat ?? client.lat,
    lng: lng ?? client.lng,
    scheduledAt,
    paymentMethod: paymentMethodValue,
    paymentStatus: paymentStatusValue,
  });

  res.status(201).json({ order: getOrderView(order) });
});

router.patch("/:id/payment-submitted", requireRole("client"), (req, res) => {
  const order = findOrderById(req.params.id);
  if (!order || order.clientId !== req.user.id) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.paymentStatus === "paid") {
    return res.json({ order: getOrderView(order) });
  }

  order.paymentSubmittedAt = order.paymentSubmittedAt || new Date().toISOString();
  res.json({ order: getOrderView(order) });
});

router.patch("/:id", (req, res) => {
  const order = store.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const isClient = req.user.roles?.includes("client") && order.clientId === req.user.id;
  const isTechnician =
    req.user.roles?.includes("technician") && order.technicianId === req.user.technicianId;

  if (!isClient && !isTechnician) {
    return res.status(403).json({ error: "You cannot update this order" });
  }

  const { status } = req.body;
  const allowedStatuses = ["pending", "accepted", "in_progress", "completed", "cancelled"];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid order status" });
  }

  if (isClient && !["cancelled"].includes(status)) {
    return res.status(403).json({ error: "Clients can only cancel orders" });
  }

  if (isTechnician && status === "cancelled") {
    return res.status(403).json({ error: "Technicians cannot cancel orders directly" });
  }

  order.status = status;
  if (status === "accepted") {
    order.acceptedAt = order.acceptedAt || new Date().toISOString();
  }
  if (status === "in_progress") {
    order.startedAt = order.startedAt || new Date().toISOString();
  }
  if (status === "completed") {
    order.completedAt = order.completedAt || new Date().toISOString();
  }

  res.json({ order: getOrderView(order) });
});

router.patch("/:id/payment", requireRole("admin"), (req, res) => {
  const order = findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.paymentStatus = "paid";
  order.paidAt = new Date().toISOString();
  if (order.status === "pending") {
    order.status = "accepted";
    order.acceptedAt = new Date().toISOString();
  }

  res.json({ order: getOrderView(order) });
});

export default router;
