import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminOverview } from "@/lib/admin.functions";
import { Panel, money } from "./AdminShell";

export function OverviewPanel() {
  const overview = useServerFn(adminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => overview(),
  });

  const cards = [
    { label: "Today's bookings", value: data ? String(data.todayBookings) : "—" },
    { label: "This week", value: data ? String(data.weekBookings) : "—" },
    { label: "Pending requests", value: data ? String(data.pending) : "—" },
    { label: "Today's revenue", value: data ? money(data.todayRevenue) : "—" },
    { label: "Week revenue", value: data ? money(data.weekRevenue) : "—" },
    { label: "Collected", value: data ? money(data.collected) : "—" },
    { label: "Active services", value: data ? String(data.activeServices) : "—" },
    { label: "Registered clients", value: data ? String(data.clients) : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-2xl text-gold-gradient">{c.value}</p>
          </div>
        ))}
      </div>

      <Panel title="Top performing services">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Crunching numbers…</p>
        ) : !data?.topServices.length ? (
          <p className="text-sm text-muted-foreground">No bookings in the last 7 days yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.topServices.map((s) => (
              <li
                key={s.name}
                className="glass-soft flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm"
              >
                <span className="text-foreground">{s.name}</span>
                <span className="text-muted-foreground">
                  {s.count} bookings · {money(s.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
