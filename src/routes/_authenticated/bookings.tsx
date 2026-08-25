import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell, Panel, chipClass, money } from "@/components/admin/AdminShell";
import { listMyAppointments, cancelMyAppointment } from "@/lib/booking.functions";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings | Sapana's Touch of Class" },
      { name: "description", content: "View, track and cancel your salon appointments." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Bookings | Sapana's Touch of Class" },
      { property: "og:description", content: "View, track and cancel your salon appointments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const queryClient = useQueryClient();
  const fetchAppointments = useServerFn(listMyAppointments);
  const cancel = useServerFn(cancelMyAppointment);

  const { data, isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => fetchAppointments(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not cancel"),
  });

  return (
    <AdminShell eyebrow="Your visits" title="My bookings">
      <Panel title="Appointments">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your appointments…</p>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">You have no appointments yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.map((a) => (
              <li
                key={a.id}
                className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
              >
                <div>
                  <p className="text-sm text-foreground">
                    {a.date} · {a.time_slot}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.serviceNames.join(", ")}
                    {a.stylist ? ` · ${a.stylist}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-gold">
                    {a.status}
                  </span>
                  <span className="text-sm text-foreground">{money(Number(a.total_price))}</span>
                  {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                    <button
                      className={chipClass}
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(a.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AdminShell>
  );
}
