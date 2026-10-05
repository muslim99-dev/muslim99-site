"use client";

import { useEffect, useState } from "react";
import SocialIcon from "@/components/SocialIcon";

/** Counts one view per post per browser session. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `blog-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked — still count */
    }
    fetch(`/api/blog/${encodeURIComponent(slug)}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: "X", href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` }
  ];
  const btn = "grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-teal-dark transition-colors hover:border-primary hover:bg-primary hover:text-white";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l.name}`} title={`Share on ${l.name}`} className={btn}>
          <SocialIcon name={l.name} className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="rounded-full border border-border bg-white px-3.5 py-2 text-xs font-medium text-teal-dark transition-colors hover:border-primary"
      >
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
