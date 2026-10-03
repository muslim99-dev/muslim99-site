import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/analytics";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export const metadata = { title: "Traffic analytics — Muslim99 Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

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

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <Gate title="Admin sign-in required">
        <p>Sign in with an admin account to view traffic analytics.</p>
        <Link
          href="/auth/signin?callbackUrl=%2Fadmin%2Fanalytics"
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
        <p>This account doesn&apos;t have access to analytics.</p>
      </Gate>
    );
  }

  return (
    <div className="mx-auto max-w-app px-5 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-teal-dark">Traffic analytics</h1>
          <p className="mt-1 text-sm text-muted">Real-time, first-party analytics — anonymous visitor IDs, no IP addresses or personal data stored.</p>
        </div>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
