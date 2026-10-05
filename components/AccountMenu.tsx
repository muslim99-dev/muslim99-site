"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return <div className="h-10 w-20 rounded-full bg-aqua/60 animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-border px-4 text-sm font-medium text-teal-dark hover:border-primary hover:text-primary-deep transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const isAdmin = (session.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  const name = session.user?.name || session.user?.email || "Account";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const item = "block rounded-xl px-3 py-2 text-sm text-teal-dark hover:bg-aqua/50";

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={isAdmin ? "Account menu (admin)" : "Account menu"}
          title={name}
          className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-xs font-semibold text-white ring-2 ring-white transition-shadow hover:ring-aqua"
        >
          {initials}
          {isAdmin && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" title="Admin" aria-hidden />
          )}
        </button>
        {open && (
          <div role="menu" className="absolute right-0 top-11 z-50 w-60 rounded-card border border-border bg-white p-2 shadow-card">
            <div className="border-b border-border px-3 pb-2.5 pt-1.5">
              <p className="truncate text-sm font-semibold text-teal-dark">{session.user?.name || "Signed in"}</p>
              {session.user?.email && <p className="truncate text-xs text-muted">{session.user.email}</p>}
            </div>
            <div className="py-1.5">
              <Link href="/profile" className={item} role="menuitem">
                Profile
              </Link>
              <Link href="/bookmarks" className={item} role="menuitem">
                Bookmarks
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/analytics" className={item} role="menuitem">
                    Analytics
                  </Link>
                  <Link href="/admin/blog" className={item} role="menuitem">
                    Blog posts
                  </Link>
                  <Link href="/admin/messages" className={item} role="menuitem">
                    Messages
                  </Link>
                </>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              role="menuitem"
              className="w-full rounded-xl border-t border-border px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
