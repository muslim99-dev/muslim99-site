import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OTP_MAX_ATTEMPTS, codeMatches, normalizeEmail } from "@/lib/otp";

export const dynamic = "force-dynamic";

/** Step 2 of sign-up: checks the emailed code and creates the verified account. */
export async function POST(req: Request) {
  const { email, code } = await req.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);
  const cleanCode = typeof code === "string" ? code.replace(/\D/g, "") : "";
  if (!normalizedEmail || cleanCode.length !== 6) {
    return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400 });
  }

  try {
    const pending = await prisma.pendingSignup.findUnique({ where: { email: normalizedEmail } });
    if (!pending) {
      return NextResponse.json({ error: "No sign-up is waiting for this email. Please start again.", restart: true }, { status: 404 });
    }
    if (pending.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This code has expired. Request a new one.", expired: true }, { status: 410 });
    }
    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many wrong attempts. Request a new code.", expired: true }, { status: 429 });
    }

    if (!codeMatches(normalizedEmail, cleanCode, pending.codeHash)) {
      const attempts = pending.attempts + 1;
      await prisma.pendingSignup.update({ where: { email: normalizedEmail }, data: { attempts } });
      const left = OTP_MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        { error: left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong attempts. Request a new code.", expired: left <= 0 },
        { status: 400 }
      );
    }

    // Verified — create the account (unless it was created meanwhile).
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
      const created = existing
        ? null
        : await tx.user.create({
            data: { email: normalizedEmail, name: pending.name, passwordHash: pending.passwordHash, emailVerified: new Date() },
            select: { id: true, email: true, name: true }
          });
      await tx.pendingSignup.delete({ where: { email: normalizedEmail } });
      return created;
    });
    if (!user) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
    }
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("signup verify failed", err);
    return NextResponse.json({ error: "The server couldn't verify the code right now. Please try again." }, { status: 503 });
  }
}
