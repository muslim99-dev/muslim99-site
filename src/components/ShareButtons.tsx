"use client";

import { useState } from "react";
import { Share2, Download, Copy, Check, Loader2 } from "lucide-react";
import { generateShareImage, type ShareImageContent } from "@/lib/shareImage";
import { WhatsAppIcon, FacebookIcon, XIcon, InstagramIcon } from "./SocialIcons";
import { SITE_CONFIG } from "@/constants/site";

// Cross-platform sharing has one real constraint: a freshly generated,
// unhosted image can't be embedded into a URL-based share intent (WhatsApp
// web, Facebook's sharer.php, X's intent endpoint all only accept text/a
// public URL — none can carry a local image blob). So every platform button
// here downloads the branded graphic first (so it's ready to attach) and
// then opens that platform's own share flow with the quote text and site
// link prefilled. Where the browser supports the native Web Share API with
// files (most mobile browsers), the primary "Share" button can hand the
// image directly to whichever app the reader picks — including Instagram,
// which has no web share-intent URL of its own.
export default function ShareButtons({ content, shareText }: { content: ShareImageContent; shareText: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function getImageFile(): Promise<File> {
    const blob = await generateShareImage(content);
    return new File([blob], "muslim99-daily.png", { type: "image/png" });
  }

  async function downloadImage() {
    const file = await getImageFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    try {
      await action();
    } catch {
      // user cancelled the native share sheet, or generation failed —
      // nothing more to do here
    } finally {
      setBusy(null);
    }
  }

  async function handleNativeShare() {
    await run("share", async () => {
      const file = await getImageFile();
      const shareData = { files: [file], title: "Muslim99", text: shareText };
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await downloadImage();
      }
    });
  }

  async function handleCopy() {
    await run("copy", async () => {
      try {
        // Prefer copying the actual graphic — most useful when pasting
        // straight into a chat app or post composer.
        const blob = await generateShareImage(content);
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch {
        // Clipboard image support varies by browser — fall back to the
        // plain quote text, which every browser can copy.
        await navigator.clipboard.writeText(shareText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function openPlatform(key: string, url: string) {
    run(key, async () => {
      await downloadImage();
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  const encodedText = encodeURIComponent(`${shareText}\n\n${SITE_CONFIG.url}`);
  const encodedUrl = encodeURIComponent(SITE_CONFIG.url);
  const encodedQuote = encodeURIComponent(shareText);

  return (
    <div className="mt-5 flex items-center justify-center gap-2 border-t pt-4" style={{ borderColor: "var(--hair)" }}>
      <IconButton label="Share" busy={busy === "share"} onClick={handleNativeShare}>
        <Share2 size={16} />
      </IconButton>
      <IconButton label="WhatsApp" busy={busy === "whatsapp"} onClick={() => openPlatform("whatsapp", `https://wa.me/?text=${encodedText}`)}>
        <WhatsAppIcon size={16} />
      </IconButton>
      <IconButton
        label="Facebook"
        busy={busy === "facebook"}
        onClick={() => openPlatform("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`)}
      >
        <FacebookIcon size={16} />
      </IconButton>
      <IconButton label="X" busy={busy === "x"} onClick={() => openPlatform("x", `https://twitter.com/intent/tweet?text=${encodedText}`)}>
        <XIcon size={16} />
      </IconButton>
      <IconButton label="Instagram" busy={busy === "instagram"} onClick={() => run("instagram", downloadImage)}>
        <InstagramIcon size={16} />
      </IconButton>
      <IconButton label={copied ? "Copied!" : "Copy"} busy={busy === "copy"} onClick={handleCopy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </IconButton>
      <IconButton label="Download image" busy={busy === "download"} onClick={() => run("download", downloadImage)}>
        <Download size={16} />
      </IconButton>
    </div>
  );
}

function IconButton({ label, busy, onClick, children }: { label: string; busy: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-60"
      style={{ background: "var(--soft)", color: "var(--primary)" }}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}
