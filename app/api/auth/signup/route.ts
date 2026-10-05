import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mailConfigured, sendVerificationCode } from "@/lib/mailer";
import { OTP_RESEND_MS, OTP_TTL_MS, generateCode, hashCode, isEmail, normalizeEmail } from "@/lib/otp";

export const dynamic = "force-dynamic";

/**
 * Step 1 of sign-up: validates the details and emails a 6-digit code.
 * Nothing is created in User until the code is confirmed at
 * /api/auth/signup/verify.
 */
export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);

  if (!isEmail(normalizedEmail) || typeof password !== "string" || password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "A valid email and a password of at least 8 characters are required." }, { status: 400 });
  }

  try {
    if (await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
    }

    if (!mailConfigured()) {
      console.error("signup: SMTP is not configured — can't send verification codes");
      return NextResponse.json(
        { error: "Email verification is temporarily unavailable, so new accounts can't be created right now. Please try again later." },
        { status: 503 }
      );
    }

    const pending = await prisma.pendingSignup.findUnique({ where: { email: normalizedEmail } });
    if (pending && Date.now() - pending.sentAt.getTime() < OTP_RESEND_MS) {
      const wait = Math.ceil((OTP_RESEND_MS - (Date.now() - pending.sentAt.getTime())) / 1000);
      return NextResponse.json({ error: `A code was just sent. Please wait ${wait}s before requesting another.`, retryAfter: wait }, { status: 429 });
    }

    const code = generateCode();
    const cleanName = typeof name === "string" && name.trim() ? name.trim().slice(0, 80) : null;
    const data = {
      name: cleanName,
      passwordHash: await bcrypt.hash(password, 12),
      codeHash: hashCode(normalizedEmail, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      sentAt: new Date()
    };
    await prisma.pendingSignup.upsert({ where: { email: normalizedEmail }, create: { email: normalizedEmail, ...data }, update: data });

    try {
      await sendVerificationCode(normalizedEmail, code, cleanName);
    } catch (err) {
      console.error("signup: sending the verification email failed", err);
      await prisma.pendingSignup.delete({ where: { email: normalizedEmail } }).catch(() => null);
      return NextResponse.json({ error: "We couldn't send the verification email. Check the address and try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, email: normalizedEmail, expiresInSec: OTP_TTL_MS / 1000, resendInSec: OTP_RESEND_MS / 1000 });
  } catch (err) {
    console.error("signup failed", err);
    return NextResponse.json({ error: "The server couldn't start your sign-up right now. Please try again in a moment." }, { status: 503 });
  }
}
