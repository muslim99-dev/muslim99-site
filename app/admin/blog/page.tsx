import AdminShell from "@/components/admin/AdminShell";
import BlogAdminList from "@/components/admin/BlogAdminList";

export const metadata = { title: "Blog — Muslim99 Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function BlogAdminPage() {
  return (
    <AdminShell current="/admin/blog" title="Blog" subtitle="Write, publish and manage the articles on themuslim99.com/blog.">
      <BlogAdminList />
    </AdminShell>
  );
}
