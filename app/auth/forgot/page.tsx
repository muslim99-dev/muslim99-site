"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import PasswordInput from "@/components/PasswordInput";

const field = "mt-1 w-full rounded-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { res, data } = await post("/api/auth/forgot", { email });
      if (!res.ok && !data.retryAfter) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setResendIn(data.retryAfter ?? data.resendInSec ?? 60);
      setStep("reset");
      setInfo(data.retryAfter ? "We already sent a code — check your inbox." : "If an account exists for this email, we've sent it a 6-digit code.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("The two passwords don't match.");
    setLoading(true);
    try {
      const { res, data } = await post("/api/auth/forgot/reset", { email, code, password });
      if (!res.ok) {
        setError(data.error || "Couldn't reset your password.");
        if (data.expired) setCode("");
        return;
      }
      const signed = await signIn("credentials", { email, password, redirect: false });
      router.push(signed?.error ? "/auth/signin" : "/profile");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-aqua text-primary-deep">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="5" y="10.5" width="14" height="10" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-teal-dark">{step === "email" ? "Forgot your password?" : "Set a new password"}</h1>
      <p className="mt-2 text-sm text-muted">
        {step === "email" ? (
          "Enter your account email and we'll send you a 6-digit code to reset your password."
        ) : (
          <>
            Enter the code sent to <span className="font-medium text-teal-dark">{email}</span> and choose a new password.
          </>
        )}
      </p>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-teal-dark">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-60">
            {loading ? "Sending code…" : "Send reset code"}
          </button>
        </form>
      ) : (
        <form onSubmit={reset} className="mt-8 space-y-4">
          {info && <p className="rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{info}</p>}
          <div>
            <label className="text-xs font-medium text-teal-dark">6-digit code</label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className={`${field} text-center text-xl font-semibold tracking-[0.5em]`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-teal-dark">New password</label>
            <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <p className="mt-1 text-[11px] text-muted">At least 8 characters.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-teal-dark">Confirm new password</label>
            <PasswordInput required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {loading ? "Saving…" : "Reset password & sign in"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
                setInfo(null);
              }}
              className="font-medium text-primary-deep"
            >
              ← Change email
            </button>
            <button type="button" onClick={() => sendCode()} disabled={resendIn > 0 || loading} className="font-medium text-primary-deep disabled:text-muted">
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/auth/signin" className="font-medium text-primary-deep">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
