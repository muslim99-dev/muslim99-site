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

/** The 6-digit sign-up verification code. */
export async function sendVerificationCode(to: string, code: string, name?: string | null) {
  if (!mailConfigured()) throw new Error("SMTP is not configured");
  const greeting = name ? `Assalamu alaikum ${name},` : "Assalamu alaikum,";
  await transport().sendMail({
    from: `"Muslim99" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} is your Muslim99 verification code`,
    text: `${greeting}\n\nYour Muslim99 verification code is: ${code}\n\nIt expires in 10 minutes. If you didn't try to create a Muslim99 account, you can ignore this email.\n\n— Muslim99 · themuslim99.com`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#F4FAFA;padding:32px 16px">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #DCEAEA;border-radius:20px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#123E40,#087D82);padding:22px 28px;color:#ffffff">
      <div style="font-size:18px;font-weight:600">Muslim99</div>
      <div style="font-size:12px;color:#C9A84C;letter-spacing:.12em;text-transform:uppercase;margin-top:4px">Verify your email</div>
    </div>
    <div style="padding:28px;color:#123E40;font-size:15px;line-height:1.6">
      <p style="margin:0 0 12px">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 20px">Use this code to finish creating your Muslim99 account:</p>
      <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#EEF7F7;border-radius:14px;padding:16px 0;color:#087D82">${code}</div>
      <p style="margin:20px 0 0;color:#5D7475;font-size:13px">The code expires in 10 minutes. If you didn't try to sign up, you can safely ignore this email.</p>
    </div>
    <div style="padding:14px 28px;border-top:1px solid #DCEAEA;color:#8AA0A1;font-size:12px">One App. A World of Islamic Knowledge. · themuslim99.com</div>
  </div>
</div>`
  });
}

/** The 6-digit "forgot password" code. */
export async function sendPasswordResetCode(to: string, code: string, name?: string | null) {
  if (!mailConfigured()) throw new Error("SMTP is not configured");
  const greeting = name ? `Assalamu alaikum ${name},` : "Assalamu alaikum,";
  await transport().sendMail({
    from: `"Muslim99" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} is your Muslim99 password reset code`,
    text: `${greeting}\n\nYour Muslim99 password reset code is: ${code}\n\nIt expires in 10 minutes. If you didn't ask to reset your password, you can ignore this email — your password stays the same.\n\n— Muslim99 · themuslim99.com`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#F4FAFA;padding:32px 16px">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #DCEAEA;border-radius:20px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#123E40,#087D82);padding:22px 28px;color:#ffffff">
      <div style="font-size:18px;font-weight:600">Muslim99</div>
      <div style="font-size:12px;color:#C9A84C;letter-spacing:.12em;text-transform:uppercase;margin-top:4px">Reset your password</div>
    </div>
    <div style="padding:28px;color:#123E40;font-size:15px;line-height:1.6">
      <p style="margin:0 0 12px">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 20px">Use this code to set a new password for your Muslim99 account:</p>
      <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#EEF7F7;border-radius:14px;padding:16px 0;color:#087D82">${code}</div>
      <p style="margin:20px 0 0;color:#5D7475;font-size:13px">The code expires in 10 minutes. If you didn't ask for this, ignore this email — your password stays the same.</p>
    </div>
    <div style="padding:14px 28px;border-top:1px solid #DCEAEA;color:#8AA0A1;font-size:12px">One App. A World of Islamic Knowledge. · themuslim99.com</div>
  </div>
</div>`
  });
}
