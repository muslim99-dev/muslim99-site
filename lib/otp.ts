import { createHash, randomInt, timingSafeEqual } from "node:crypto";

/** Email-verification codes for sign-up. Only a hash of the code is stored. */

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export function hashCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${process.env.NEXTAUTH_SECRET ?? "muslim99"}`)
    .digest("hex");
}

export function codeMatches(email: string, code: string, storedHash: string) {
  const a = Buffer.from(hashCode(email, code), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const normalizeEmail = (e: unknown) => (typeof e === "string" ? e.trim().toLowerCase() : "");
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;
