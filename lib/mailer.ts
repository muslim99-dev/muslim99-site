import nodemailer from "nodemailer";

/**
 * Outgoing mail via SMTP (e.g. Hostinger email for themuslim99.com).
 * Configure with SMTP_HOST, SMTP_PORT (465 = SSL, 587 = STARTTLS),
 * SMTP_USER, SMTP_PASS. CONTACT_TO overrides the recipient (defaults to
 * the public contact address). Without SMTP settings, mail is skipped and
 * callers keep working (messages are still stored in the database).
 */

export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function transport() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendContactEmail(msg: { name: string; email: string; subject?: string | null; message: string }, to: string) {
  if (!mailConfigured()) return false;
  const subject = `[Muslim99 contact] ${msg.subject || `Message from ${msg.name}`}`;
  await transport().sendMail({
    from: `"Muslim99 Contact" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO || to,
    replyTo: `"${msg.name.replace(/"/g, "")}" <${msg.email}>`,
    subject,
    text: `From: ${msg.name} <${msg.email}>\nSubject: ${msg.subject || "—"}\n\n${msg.message}\n\n— Sent from the contact form on themuslim99.com`,
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0f2a2b">
      <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(msg.name)} &lt;${escapeHtml(msg.email)}&gt;</p>
      <p style="margin:0 0 16px"><strong>Subject:</strong> ${escapeHtml(msg.subject || "—")}</p>
      <div style="white-space:pre-wrap;border-left:3px solid #18A5A8;padding:8px 14px;background:#F7FCFC">${escapeHtml(msg.message)}</div>
      <p style="margin-top:20px;color:#5D7475;font-size:13px">Sent from the contact form on themuslim99.com — reply to this email to answer ${escapeHtml(msg.name)}.</p>
    </div>`
  });
  return true;
}
