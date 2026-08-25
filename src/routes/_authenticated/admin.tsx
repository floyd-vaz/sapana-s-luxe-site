import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingsPanel } from "@/components/admin/BookingsPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Sapana's Touch of Class" },
      { name: "description", content: "Manage appointments, schedules and services for the salon." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Portal | Sapana's Touch of Class" },
      { property: "og:description", content: "Manage appointments, schedules and services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AdminShell eyebrow="Management portal" title="Bookings dashboard">
      <BookingsPanel />
    </AdminShell>
  );
}
