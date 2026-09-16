import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-2xl font-semibold text-teal-dark">Assalamu Alaikum, {session.user?.name || session.user?.email}</h1>
      <p className="mt-1 text-sm text-muted">Manage your Muslim99 account and Quran journey.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/bookmarks" className="rounded-card border border-border bg-white p-5 hover:border-primary transition-colors">
          <h2 className="font-medium text-teal-dark">Bookmarks</h2>
          <p className="mt-1 text-sm text-muted">Your saved Ayahs, Duas, and more.</p>
        </Link>
        <Link href="/khatmah" className="rounded-card border border-border bg-white p-5 hover:border-primary transition-colors">
          <h2 className="font-medium text-teal-dark">Khatmah</h2>
          <p className="mt-1 text-sm text-muted">Track your Quran completion goal.</p>
        </Link>
        <Link href="/quran" className="rounded-card border border-border bg-white p-5 hover:border-primary transition-colors">
          <h2 className="font-medium text-teal-dark">Continue Reading</h2>
          <p className="mt-1 text-sm text-muted">Pick up where you left off in the Quran.</p>
        </Link>
        <Link href="/settings" className="rounded-card border border-border bg-white p-5 hover:border-primary transition-colors">
          <h2 className="font-medium text-teal-dark">Settings</h2>
          <p className="mt-1 text-sm text-muted">Prayer calculation, Asr madhhab, and preferences.</p>
        </Link>
      </div>
    </div>
  );
}
