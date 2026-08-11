import { Router } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
  sanitizeUser,
  store,
  verifyPassword,
} from "../data/store.js";
import { authMiddleware, createSession } from "../middleware/auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { name, email, password, role, phone, address, city, service, experience } =
    req.body;

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return res.status(400).json({ error: "Name, email, password, and role are required" });
  }

  // Validate role(s) - can be single string or array
  const roles = Array.isArray(role) ? role : [role];
  const validRoles = ["client", "technician"];
  const invalidRoles = roles.filter(r => !validRoles.includes(r));
  if (invalidRoles.length > 0) {
    return res.status(400).json({ error: "Invalid role(s) provided" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  if (roles.includes("technician") && !service?.trim()) {
    return res.status(400).json({ error: "Technicians must select a primary service" });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const user = createUser({
    name,
    email,
    password,
    role,
    phone,
    address,
    city,
    service,
    experience,
  });

  const token = createSession(user.id);
  store.sessions.set(token, { userId: user.id, createdAt: new Date().toISOString() });

  res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = createSession(user.id);
  store.sessions.set(token, { userId: user.id, createdAt: new Date().toISOString() });

  res.json({
    token,
    user: sanitizeUser(user),
  });
});

router.post("/logout", authMiddleware, (req, res) => {
  store.sessions.delete(req.token);
  res.json({ message: "Signed out successfully" });
});

router.get("/me", authMiddleware, (req, res) => {
  const user = findUserById(req.user.id);
  res.json({ user: sanitizeUser(user) });
});

export default router;
