import crypto from "crypto";
import db from "@/lib/db";

/**
 * Validates a Bearer token by extracting it, hashing it using SHA-256,
 * and checking if a user matches the hash inside PostgreSQL.
 * @param {string} authHeader - The inbound 'Authorization' header string
 * @returns {Promise<object|null>} The matching User model or null if invalid
 */
export async function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const rawToken = authHeader.split(" ")[1];
  if (!rawToken) {
    return null;
  }

  // Hash the token using SHA-256
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Query PostgreSQL
  const user = await db.user.findUnique({
    where: { token: hashedToken },
  });

  return user;
}
