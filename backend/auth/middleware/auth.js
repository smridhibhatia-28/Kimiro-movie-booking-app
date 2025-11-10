import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: "NO_TOKEN" });

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, email: payload.email, phone: payload.phone };
    next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}
