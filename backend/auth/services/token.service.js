import jwt from "jsonwebtoken";

/**
 * Create an access token for the user
 */
export function signAccess(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,   // optional: nice for quick frontend display
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}
