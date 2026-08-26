import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingsPanel } from "@/components/admin/BookingsPanel";
import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { ClientsPanel } from "@/components/admin/ClientsPanel";
import { ServicesPanel } from "@/components/admin/ServicesPanel";
import { SchedulePanel } from "@/components/admin/SchedulePanel";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";

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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "schedule", label: "Schedule" },
  { id: "services", label: "Services" },
  { id: "clients", label: "Clients" },
  { id: "reviews", label: "Reviews" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <AdminShell eyebrow="Management portal" title="Salon control centre">
      <div className="glass-soft mb-8 flex flex-wrap gap-1 rounded-full p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              tab === t.id ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewPanel />}
      {tab === "bookings" && <BookingsPanel />}
      {tab === "schedule" && <SchedulePanel />}
      {tab === "services" && <ServicesPanel />}
      {tab === "clients" && <ClientsPanel />}
      {tab === "reviews" && <ReviewsPanel />}
    </AdminShell>
  );
}
