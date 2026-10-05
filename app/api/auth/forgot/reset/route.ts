import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { OTP_MAX_ATTEMPTS, codeMatches, normalizeEmail } from "@/lib/otp";

export const dynamic = "force-dynamic";

/** Forgot password, step 2: checks the emailed code and sets the new password. */
export async function POST(req: Request) {
  const { email, code, password } = await req.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);
  const cleanCode = typeof code === "string" ? code.replace(/\D/g, "") : "";
  if (!normalizedEmail || cleanCode.length !== 6) return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400 });
  if (typeof password !== "string" || password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "The new password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const reset = await prisma.passwordReset.findUnique({ where: { email: normalizedEmail } });
    if (!reset || reset.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This code has expired or isn't valid. Request a new one.", expired: true }, { status: 410 });
    }
    if (reset.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many wrong attempts. Request a new code.", expired: true }, { status: 429 });
    }
    if (!codeMatches(normalizedEmail, cleanCode, reset.codeHash)) {
      const attempts = reset.attempts + 1;
      await prisma.passwordReset.update({ where: { email: normalizedEmail }, data: { attempts } });
      const left = OTP_MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        { error: left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong attempts. Request a new code.", expired: left <= 0 },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true, emailVerified: true } });
    if (!user) {
      await prisma.passwordReset.delete({ where: { email: normalizedEmail } }).catch(() => null);
      return NextResponse.json({ error: "No account was found for this email.", expired: true }, { status: 404 });
    }
    await prisma.$transaction([
      // Receiving the code also proves the person owns the address.
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(password, 12), ...(!user.emailVerified && { emailVerified: new Date() }) }
      }),
      prisma.passwordReset.delete({ where: { email: normalizedEmail } })
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("password reset failed", err);
    return NextResponse.json({ error: "The server couldn't reset your password right now. Please try again." }, { status: 503 });
  }
}
