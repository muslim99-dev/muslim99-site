import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/analytics";

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <div className="rounded-card border border-border bg-white p-10">
        <h1 className="text-lg font-semibold text-teal-dark">{title}</h1>
        <div className="mt-2 text-sm text-muted">{children}</div>
      </div>
    </div>
  );
}

const TABS = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/messages", label: "Messages" }
];

/** Server-side admin gate + admin header with tabs. Only the analytics
 * admin account (lib/analytics.ts) ever gets past it. */
export default async function AdminShell({
  current,
  title,
  subtitle,
  children
}: {
  current: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <Gate title="Admin sign-in required">
        <p>Sign in with the admin account to continue.</p>
        <Link
          href={`/auth/signin?callbackUrl=${encodeURIComponent(current)}`}
          className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-deep"
        >
          Sign In
        </Link>
      </Gate>
    );
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <Gate title="Admins only">
        <p>This account doesn&apos;t have access to this page.</p>
      </Gate>
    );
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-teal-dark">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <nav className="inline-flex rounded-full border border-border bg-white p-1 text-sm" aria-label="Admin sections">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.href === current ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                t.href === current ? "bg-teal-dark text-white" : "text-muted hover:text-teal-dark"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
