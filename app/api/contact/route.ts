import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/mailer";
import { SITE_EMAIL } from "@/lib/site";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 3000; // humans take longer than this to write a message

// Light per-instance rate limit: 5 messages per 10 minutes per client.
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  // Spam traps: a hidden field bots fill in, and an impossibly fast submit.
  if (body.website || (typeof body.startedAt === "number" && Date.now() - body.startedAt < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }
  if (!name || name.length > 100) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (subject.length > 150) return NextResponse.json({ error: "Please shorten the subject." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: "Please write a message of at least 10 characters." }, { status: 400 });
  if (message.length > 5000) return NextResponse.json({ error: "Please keep your message under 5,000 characters." }, { status: 400 });

  const client = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (limited(client)) return NextResponse.json({ error: "Too many messages — please try again in a few minutes." }, { status: 429 });

  let saved;
  try {
    saved = await prisma.contactMessage.create({ data: { name, email, subject: subject || null, message } });
  } catch (err) {
    console.error("contact: save failed", err);
    return NextResponse.json({ error: "We couldn't send your message right now. Please email us directly." }, { status: 503 });
  }

  try {
    if (await sendContactEmail({ name, email, subject, message }, SITE_EMAIL)) {
      await prisma.contactMessage.update({ where: { id: saved.id }, data: { emailed: true } });
    }
  } catch (err) {
    // Stored safely in the inbox even if mail delivery fails.
    console.error("contact: email failed", err);
  }

  return NextResponse.json({ ok: true });
}
