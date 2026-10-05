import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Change password for the signed-in user (requires the current password). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 200) {
    return NextResponse.json({ error: "The new password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) return NextResponse.json({ error: "Account not found. Please sign in again." }, { status: 404 });
    if (user.passwordHash) {
      if (typeof currentPassword !== "string" || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
        return NextResponse.json({ error: "Your current password isn't correct." }, { status: 400 });
      }
      if (await bcrypt.compare(newPassword, user.passwordHash)) {
        return NextResponse.json({ error: "Choose a password different from your current one." }, { status: 400 });
      }
    }
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("change password failed", err);
    return NextResponse.json({ error: "The server couldn't update your password right now. Please try again." }, { status: 503 });
  }
}
