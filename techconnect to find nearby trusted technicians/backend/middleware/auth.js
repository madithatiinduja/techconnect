import {
  createToken,
  findSession,
  findUserById,
  sanitizeUser,
} from "../data/store.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const session = findSession(token);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const user = findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = sanitizeUser(user);
  req.token = token;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !roles.some((role) => req.user.roles.includes(role))) {
      return res.status(403).json({ error: "You do not have access to this resource" });
    }
    next();
  };
}

export function createSession(userId) {
  const token = createToken();
  return token;
}
