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
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-teal-dark hover:border-primary hover:text-primary-deep transition-colors"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="text-sm text-teal-dark hover:text-primary-deep transition-colors max-w-[9rem] truncate"
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
