"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-semibold text-teal-dark">Sign in to Muslim99</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to sync your bookmarks, notes, Khatmah progress, and settings across devices.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-teal-dark">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-teal-dark">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-deep transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary-deep font-medium">
          Create one
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted">
        You can also continue as a guest — core Quran reading, prayer times, and Qibla work without an account.
      </p>
    </div>
  );
}
