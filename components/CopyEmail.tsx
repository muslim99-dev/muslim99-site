"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      className="rounded-full border border-border px-4 py-2 text-xs font-medium text-teal-dark transition-colors hover:border-primary"
    >
      {copied ? "Copied ✓" : "Copy address"}
    </button>
  );
}
