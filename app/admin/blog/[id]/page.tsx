import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import AdminShell from "@/components/admin/AdminShell";
import BlogEditor from "@/components/admin/BlogEditor";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit post — Muslim99 Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // Load the post only for the admin; AdminShell shows the sign-in / admins-only screen otherwise.
  if (!isAdminEmail(session?.user?.email)) {
    return <AdminShell current="/admin/blog" title="Edit post">{null}</AdminShell>;
  }
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  return (
    <AdminShell current="/admin/blog" title="Edit post">
      <BlogEditor
        post={{
          ...post,
          status: post.status,
          publishedAt: post.publishedAt?.toISOString() ?? null
        }}
        defaultAuthor={session?.user?.name || "Muslim99 Team"}
      />
    </AdminShell>
  );
}
