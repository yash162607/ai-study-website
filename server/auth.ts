import crypto from "crypto";
import bcrypt from "bcryptjs";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith("$2")) return bcrypt.compareSync(password, storedHash);
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const derivedHash = crypto.scryptSync(password, salt, 64);
  const expectedHash = Buffer.from(hash, "hex");
  return expectedHash.length === derivedHash.length && crypto.timingSafeEqual(expectedHash, derivedHash);
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}