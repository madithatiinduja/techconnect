import { Router } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  saveSession,
  sanitizeUser,
  removeSession,
  verifyPassword,
} from "../data/store.js";
import { authMiddleware, createSession } from "../middleware/auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { name, username, email, password, role, phone, address, city, service, experience } =
    req.body;

  // Validate role(s) - can be single string or array
  const roles = Array.isArray(role) ? role : [role];
  const validRoles = ["client", "technician", "admin"];
  const invalidRoles = roles.filter((r) => !validRoles.includes(r));
  if (invalidRoles.length > 0) {
    return res.status(400).json({ error: "Invalid role(s) provided" });
  }

  if (!password || !role || (roles.includes("admin") ? !username?.trim() : !name?.trim() || !email?.trim())) {
    return res.status(400).json({
      error: roles.includes("admin")
        ? "Username, password, and role are required"
        : "Name, email, password, and role are required",
    });
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

  if (findUserByUsername(username)) {
    return res.status(409).json({ error: "That username is already taken" });
  }

  const user = createUser({
    name: name || username,
    username,
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
  saveSession(token, user.id);

  res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
});

router.post("/login", (req, res) => {
  const { email, username, password } = req.body;
  const identifier = username || email;

  if (!identifier?.trim() || !password) {
    return res.status(400).json({ error: "Username/email and password are required" });
  }

  const user = findUserByUsername(identifier) || findUserByEmail(identifier);
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = createSession(user.id);
  saveSession(token, user.id);

  res.json({
    token,
    user: sanitizeUser(user),
  });
});

router.post("/logout", authMiddleware, (req, res) => {
  removeSession(req.token);
  res.json({ message: "Signed out successfully" });
});

router.get("/me", authMiddleware, (req, res) => {
  const user = findUserById(req.user.id);
  res.json({ user: sanitizeUser(user) });
});

export default router;
