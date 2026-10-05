import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mailConfigured, sendPasswordResetCode } from "@/lib/mailer";
import { OTP_RESEND_MS, OTP_TTL_MS, generateCode, hashCode, isEmail, normalizeEmail } from "@/lib/otp";

export const dynamic = "force-dynamic";

/**
 * Forgot password, step 1: emails a reset code if an account exists.
 * The reply is the same either way, so the form can't be used to find
 * out which emails have accounts.
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);
  if (!isEmail(normalizedEmail)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Password reset by email is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const ok = NextResponse.json({ ok: true, resendInSec: OTP_RESEND_MS / 1000 });
  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { name: true, passwordHash: true } });
    if (!user?.passwordHash) return ok;

    const existing = await prisma.passwordReset.findUnique({ where: { email: normalizedEmail } });
    if (existing && Date.now() - existing.sentAt.getTime() < OTP_RESEND_MS) {
      const wait = Math.ceil((OTP_RESEND_MS - (Date.now() - existing.sentAt.getTime())) / 1000);
      return NextResponse.json({ error: `A code was just sent. Please wait ${wait}s before requesting another.`, retryAfter: wait }, { status: 429 });
    }

    const code = generateCode();
    const data = { codeHash: hashCode(normalizedEmail, code), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, sentAt: new Date() };
    await prisma.passwordReset.upsert({ where: { email: normalizedEmail }, create: { email: normalizedEmail, ...data }, update: data });
    await sendPasswordResetCode(normalizedEmail, code, user.name);
    return ok;
  } catch (err) {
    console.error("forgot password failed", err);
    return NextResponse.json({ error: "We couldn't send the reset email right now. Please try again." }, { status: 502 });
  }
}
