"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import PasswordInput from "@/components/PasswordInput";

const field = "mt-1 w-full rounded-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  // A server error can come back without a JSON body — never leave a button spinning.
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await post("/api/auth/signup", { name, email, password });
      if (!res.ok) {
        if (data.retryAfter) {
          // A code is already on its way — go to the code step.
          setStep("code");
          setResendIn(data.retryAfter);
          setInfo("We already sent a code to this email. Check your inbox.");
        } else setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStep("code");
      setDigits(Array(6).fill(""));
      setResendIn(data.resendInSec ?? 60);
      setInfo(null);
      setTimeout(() => boxes.current[0]?.focus(), 50);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(code: string) {
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await post("/api/auth/signup/verify", { email, code });
      if (!res.ok) {
        setError(data.error || "Couldn't verify the code.");
        if (data.restart) setStep("details");
        setDigits(Array(6).fill(""));
        boxes.current[0]?.focus();
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/auth/signin");
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError(null);
    setInfo(null);
    const { res, data } = await post("/api/auth/signup/resend", { email }).catch(() => ({ res: { ok: false } as Response, data: {} as Record<string, unknown> }));
    if (!res.ok) {
      if (data.retryAfter) setResendIn(Number(data.retryAfter));
      if (data.restart) setStep("details");
      setError(String(data.error || "Couldn't send a new code."));
      return;
    }
    setResendIn(Number(data.resendInSec) || 60);
    setDigits(Array(6).fill(""));
    setInfo("A new code is on its way.");
    boxes.current[0]?.focus();
  }

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      // Pasted the whole code.
      const next = clean.slice(0, 6).split("");
      const filled = [...next, ...Array(6 - next.length).fill("")];
      setDigits(filled);
      boxes.current[Math.min(next.length, 5)]?.focus();
      if (next.length === 6) verify(next.join(""));
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 5) boxes.current[i + 1]?.focus();
    if (next.every((d) => d)) verify(next.join(""));
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      {step === "details" ? (
        <>
          <h1 className="text-2xl font-semibold text-teal-dark">Create your Muslim99 account</h1>
          <p className="mt-2 text-sm text-muted">Save bookmarks, notes, Khatmah progress, and settings across devices.</p>

          <form onSubmit={requestCode} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-teal-dark">Name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
            </div>
            <div>
              <label className="text-xs font-medium text-teal-dark">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} />
            </div>
            <div>
              <label className="text-xs font-medium text-teal-dark">Password</label>
              <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <p className="mt-1 text-[11px] text-muted">At least 8 characters.</p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-60"
            >
              {loading ? "Sending code…" : "Continue"}
            </button>
            <p className="text-center text-[11px] text-muted">We&apos;ll email you a 6-digit code to verify your address.</p>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary-deep">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-aqua text-primary-deep">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
              <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-center text-2xl font-semibold text-teal-dark">Check your email</h1>
          <p className="mt-2 text-center text-sm text-muted">
            We sent a 6-digit code to <span className="font-medium text-teal-dark">{email}</span>. It expires in 10 minutes.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (digits.every((d) => d)) verify(digits.join(""));
            }}
            className="mt-8"
          >
            <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={6}
                  aria-label={`Digit ${i + 1}`}
                  disabled={loading}
                  className="h-14 w-11 rounded-2xl border border-border bg-white text-center text-2xl font-semibold text-teal-dark outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-12"
                />
              ))}
            </div>
            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            {info && !error && <p className="mt-4 text-center text-sm text-emerald-700">{info}</p>}
            <button
              type="submit"
              disabled={loading || !digits.every((d) => d)}
              className="mt-6 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & create account"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              onClick={() => {
                setStep("details");
                setError(null);
                setInfo(null);
              }}
              className="font-medium text-primary-deep"
            >
              ← Change email
            </button>
            <button onClick={resend} disabled={resendIn > 0} className="font-medium text-primary-deep disabled:text-muted">
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </div>
          <p className="mt-6 text-center text-[11px] text-muted">Can&apos;t find it? Check your spam or promotions folder.</p>
        </>
      )}
    </div>
  );
}
