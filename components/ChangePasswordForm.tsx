"use client";

import Link from "next/link";
import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

/** Profile page: change the account password (current password required). */
export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) return setError("The new passwords don't match.");
    setLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Couldn't update your password.");
      setDone(true);
      setOpen(false);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-card border border-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-medium text-teal-dark">Password</h2>
          <p className="mt-1 text-sm text-muted">{done ? "✓ Your password was updated." : "Change the password you use to sign in."}</p>
        </div>
        {!open && (
          <button
            onClick={() => {
              setOpen(true);
              setDone(false);
            }}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-teal-dark transition-colors hover:border-primary"
          >
            Change password
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:max-w-md">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-teal-dark">Current password</label>
              <Link href="/auth/forgot" className="text-xs font-medium text-primary-deep hover:underline">
                Forgot it?
              </Link>
            </div>
            <PasswordInput required value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <label className="text-xs font-medium text-teal-dark">New password</label>
            <PasswordInput required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
            <p className="mt-1 text-[11px] text-muted">At least 8 characters.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-teal-dark">Confirm new password</label>
            <PasswordInput required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-60">
              {loading ? "Saving…" : "Update password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-teal-dark hover:border-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
