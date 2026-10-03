import AdminShell from "@/components/admin/AdminShell";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export const metadata = { title: "Traffic analytics — Muslim99 Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <AdminShell
      current="/admin/analytics"
      title="Traffic analytics"
      subtitle="Real-time, first-party analytics — anonymous visitor IDs, no IP addresses or personal data stored."
    >
      <AnalyticsDashboard />
    </AdminShell>
  );
}
