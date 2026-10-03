"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let signInRes;
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      // A server error can come back without a JSON body — never leave the button spinning.
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data.error ||
            (res.status >= 500 ? "The server couldn't create your account right now. Please try again in a moment." : "Something went wrong.")
        );
        setLoading(false);
        return;
      }

      signInRes = await signIn("credentials", { email, password, redirect: false });
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    if (signInRes?.error) {
      router.push("/auth/signin");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-semibold text-teal-dark">Create your Muslim99 account</h1>
      <p className="mt-2 text-sm text-muted">Save bookmarks, notes, Khatmah progress, and settings across devices.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-teal-dark">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-[11px] text-muted">At least 8 characters.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-deep transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-primary-deep font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
