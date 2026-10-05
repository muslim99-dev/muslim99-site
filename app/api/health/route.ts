import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Deployment health check. Reports whether the database is reachable and,
 * if not, which kind of problem it is — never the connection string,
 * host or credentials.
 */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DATABASE_URL_looks_valid: /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? ""),
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    // Needed for sign-up verification codes and contact-form emails (yes/no only).
    SMTP_configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "connected", env }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const name = err instanceof Error ? err.constructor.name : "Error";
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { errorCode?: string; code?: string }).errorCode ?? (err as { code?: string }).code ?? null;
    const problem = /Environment variable not found|DATABASE_URL/i.test(message) && !env.DATABASE_URL
      ? "DATABASE_URL is not set for this deployment"
      : /must start with the protocol|invalid.*url|the URL must/i.test(message)
        ? "DATABASE_URL is not a valid postgresql:// URL (check for quotes or spaces)"
        : /Query Engine|could not locate|libquery_engine|binaryTargets/i.test(message)
          ? "Prisma query engine is missing from the deployment"
          : /Authentication failed|password authentication/i.test(message)
            ? "Database rejected the username/password"
            : /Can't reach database server|ECONNREFUSED|ETIMEDOUT|timed out/i.test(message)
              ? "Database server can't be reached from the host"
              : /does not exist/i.test(message)
                ? "Database or table does not exist"
                : "Other database error";
    return NextResponse.json({ ok: false, db: "error", problem, errorType: name, code, env }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
