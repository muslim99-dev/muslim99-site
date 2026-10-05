import { getServerSession } from "next-auth";
import AdminShell from "@/components/admin/AdminShell";
import BlogEditor from "@/components/admin/BlogEditor";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "New post — Muslim99 Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  return (
    <AdminShell current="/admin/blog/new" title="New post">
      <BlogEditor post={null} defaultAuthor={session?.user?.name || "Muslim99 Team"} />
    </AdminShell>
  );
}
