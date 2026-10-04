"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AccountMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20 rounded-full bg-aqua/60 animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm font-medium text-teal-dark hover:border-primary hover:text-primary-deep transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const isAdmin = (session.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Link
          href="/admin/analytics"
          className="flex items-center gap-1.5 rounded-full bg-teal-dark px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-deep transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
          Admin
        </Link>
      )}
      <Link
        href="/profile"
        className="hidden xl:block text-sm text-teal-dark hover:text-primary-deep transition-colors max-w-[9rem] truncate"
      >
        {session.user?.name || session.user?.email}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary-deep transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
