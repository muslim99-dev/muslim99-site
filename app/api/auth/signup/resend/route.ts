import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mailConfigured, sendVerificationCode } from "@/lib/mailer";
import { OTP_RESEND_MS, OTP_TTL_MS, generateCode, hashCode, normalizeEmail } from "@/lib/otp";

export const dynamic = "force-dynamic";

/** Sends a fresh sign-up code (at most once a minute) and resets the attempt count. */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Email verification is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  try {
    const pending = await prisma.pendingSignup.findUnique({ where: { email: normalizedEmail } });
    if (!pending) return NextResponse.json({ error: "No sign-up is waiting for this email. Please start again.", restart: true }, { status: 404 });
    const since = Date.now() - pending.sentAt.getTime();
    if (since < OTP_RESEND_MS) {
      const wait = Math.ceil((OTP_RESEND_MS - since) / 1000);
      return NextResponse.json({ error: `Please wait ${wait}s before requesting another code.`, retryAfter: wait }, { status: 429 });
    }
    const code = generateCode();
    await prisma.pendingSignup.update({
      where: { email: normalizedEmail },
      data: { codeHash: hashCode(normalizedEmail, code), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, sentAt: new Date() }
    });
    await sendVerificationCode(normalizedEmail, code, pending.name);
    return NextResponse.json({ ok: true, resendInSec: OTP_RESEND_MS / 1000 });
  } catch (err) {
    console.error("signup resend failed", err);
    return NextResponse.json({ error: "We couldn't send a new code right now. Please try again." }, { status: 502 });
  }
}
