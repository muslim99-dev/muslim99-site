"use client";

// Renders a branded, shareable graphic (1080x1080, social-post friendly) for
// a Verse/Hadith-of-the-day card entirely on <canvas> — no external design
// tool or pre-made template file needed. Includes the Muslim99 logo, the
// quote text, its reference, and a footer pointing to the app stores and
// the website, matching what the on-page card shows.

export interface ShareImageContent {
  label: string; // e.g. "HADITH OF THE DAY"
  primaryText: string; // Arabic
  // "quran" for actual ayah text (uses the Uthmani Mushaf font); "arabic"
  // for general Arabic wording like hadith text (that font renders standard
  // Arabic diacritics as broken glyphs outside genuine Quran text).
  primaryScript: "quran" | "arabic";
  secondaryText?: string | null; // Urdu translation, when present
  reference: string;
}

const SIZE = 1080;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const points = 8;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / points) * i;
    const x = cx + radius * Math.sin(angle);
    const y = cy - radius * Math.cos(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

export async function generateShareImage(content: ShareImageContent): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  // Background — brand gradient.
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#12676b");
  bg.addColorStop(1, "#0b3f42");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle repeating 8-point star lattice, echoing the site's own motif.
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  const step = 96;
  for (let y = -step; y < SIZE + step; y += step) {
    for (let x = -step; x < SIZE + step; x += step) {
      drawStar(ctx, x, y, 26);
    }
  }
  ctx.restore();

  // Logo + wordmark.
  try {
    const logo = await loadImage("/logo/logo-192.png");
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(SIZE / 2 - 44, 54, 88, 88, 20);
    ctx.clip();
    ctx.drawImage(logo, SIZE / 2 - 44, 54, 88, 88);
    ctx.restore();
  } catch {
    // logo unavailable — still produce a usable graphic without it
  }
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 42px system-ui, -apple-system, sans-serif";
  ctx.fillText("Muslim99", SIZE / 2, 182);

  // White content card.
  const pad = 64;
  const cardX = pad;
  const cardY = 220;
  const cardW = SIZE - pad * 2;
  const cardH = SIZE - cardY - 200;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 40);
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.fill();
  ctx.restore();

  const maxTextWidth = cardW - 120;

  // Label.
  ctx.fillStyle = "#1c7074";
  ctx.font = "700 26px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(content.label, SIZE / 2, cardY + 64);

  // Primary text (Arabic), right-to-left, wrapped and centered.
  ctx.direction = "rtl";
  // Not KFGQPC Uthmanic Script HAFS here — this site's Quran text is in the
  // Indo-Pak Mushaf encoding, which that font renders as broken glyphs
  // (see the note in globals.css next to --font-arabic).
  ctx.font = content.primaryScript === "quran" ? "600 42px 'Amiri Quran', 'Amiri', serif" : "600 42px 'Amiri', serif";
  ctx.fillStyle = "#1e293b";
  const primaryLines = wrapText(ctx, content.primaryText, maxTextWidth);
  let cursorY = cardY + 130;
  const lineHeight = 64;
  for (const line of primaryLines) {
    ctx.fillText(line, SIZE / 2, cursorY);
    cursorY += lineHeight;
  }

  if (content.secondaryText) {
    cursorY += 16;
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 80, cursorY);
    ctx.lineTo(cardX + cardW - 80, cursorY);
    ctx.stroke();
    cursorY += 46;

    ctx.font = "500 32px 'Noto Nastaliq Urdu', serif";
    ctx.fillStyle = "#334155";
    const secondaryLines = wrapText(ctx, content.secondaryText, maxTextWidth);
    const secondaryLineHeight = 54;
    for (const line of secondaryLines) {
      ctx.fillText(line, SIZE / 2, cursorY);
      cursorY += secondaryLineHeight;
    }
  }

  // Reference, pinned near the bottom of the card.
  ctx.direction = "ltr";
  ctx.font = "600 24px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#1c7074";
  ctx.fillText(`— ${content.reference} —`, SIZE / 2, cardY + cardH - 36);

  // Footer.
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 27px system-ui, -apple-system, sans-serif";
  ctx.fillText("Download the Muslim99 App", SIZE / 2, SIZE - 128);
  ctx.font = "500 22px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Google Play  ·  App Store", SIZE / 2, SIZE - 90);
  ctx.font = "600 26px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("www.themuslim99.com", SIZE / 2, SIZE - 46);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob failed"))), "image/png");
  });
}
