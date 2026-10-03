import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string" || !password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "A valid email and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: typeof name === "string" && name.trim() ? name.trim() : null,
        passwordHash
      }
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    // Usually a missing/invalid DATABASE_URL on the host — logged for the server logs.
    console.error("signup failed", err);
    return NextResponse.json(
      { error: "The server couldn't create your account right now. Please try again in a moment." },
      { status: 503 }
    );
  }
}
