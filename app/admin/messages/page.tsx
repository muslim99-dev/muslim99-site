import AdminShell from "@/components/admin/AdminShell";
import MessagesInbox from "@/components/admin/MessagesInbox";
import { mailConfigured } from "@/lib/mailer";
import { SITE_EMAIL } from "@/lib/site";

export const metadata = { title: "Messages — Muslim99 Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <AdminShell
      current="/admin/messages"
      title="Messages"
      subtitle={
        mailConfigured()
          ? `Messages from the Contact page — also emailed to ${process.env.CONTACT_TO || SITE_EMAIL}.`
          : "Messages from the Contact page. Email forwarding isn't configured yet, so they're saved here only."
      }
    >
      <MessagesInbox />
    </AdminShell>
  );
}
