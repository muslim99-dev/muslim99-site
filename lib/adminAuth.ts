import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { isAdminEmail } from "./analytics";

/** For admin API routes: `denied` is a 401/403 response, or null when the
 * request comes from the admin account. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { denied: NextResponse.json({ error: "Sign in required." }, { status: 401 }), session: null };
  if (!isAdminEmail(session.user.email)) return { denied: NextResponse.json({ error: "Admins only." }, { status: 403 }), session: null };
  return { denied: null, session };
}
