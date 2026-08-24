import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListAppointments, adminUpdateAppointment } from "@/lib/admin.functions";
import { TIME_SLOTS } from "@/lib/booking.schemas";
import { Panel, inputClass, chipClass, money } from "./AdminShell";

type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time_slot: string;
  status: string;
  payment_status: string;
  total_price: number;
  notes: string | null;
  serviceNames: string[];
  stylist: string | null;
};

const statusTone: Record<string, string> = {
  PENDING: "text-amber-300",
  CONFIRMED: "text-emerald-300",
  COMPLETED: "text-sky-300",
  CANCELLED: "text-rose-300",
};

export function BookingsPanel() {
  const list = useServerFn(adminListAppointments);
  const update = useServerFn(adminUpdateAppointment);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("ALL");
  const [active, setActive] = useState<Appointment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: () => list() as Promise<Appointment[]>,
  });

  const mutation = useMutation({
    mutationFn: (input: {
      id: string;
      status?: string;
      paymentStatus?: string;
      date?: string;
      timeSlot?: string;
    }) => update({ data: input as never }),
    onSuccess: () => {
      toast.success("Appointment updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setActive(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((a) => {
      if (status !== "ALL" && a.status !== status) return false;
      if (date && a.date !== date) return false;
      if (!term) return true;
      return (
        a.customer_name.toLowerCase().includes(term) ||
        a.customer_phone.includes(term) ||
        a.serviceNames.join(" ").toLowerCase().includes(term)
      );
    });
  }, [data, search, date, status]);

  return (
    <Panel title="Live booking management">
      <div className="flex flex-wrap gap-3">
        <input
          className={`${inputClass} sm:max-w-xs`}
          placeholder="Search name, phone or service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className={`${inputClass} sm:max-w-[180px]`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className={`${inputClass} sm:max-w-[180px]`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading appointments…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No appointments match these filters.</p>
      ) : (
        <div className="mt-5 -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="py-2">Client</th>
                <th className="py-2">Date &amp; slot</th>
                <th className="py-2">Services</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-border/60">
                  <td className="py-3">
                    <button
                      onClick={() => setActive(a)}
                      className="text-left transition-colors hover:text-gold"
                    >
                      <span className="block">{a.customer_name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {a.customer_phone}
                      </span>
                    </button>
                  </td>
                  <td className="py-3">
                    {a.date}
                    <span className="block text-xs text-muted-foreground">{a.time_slot}</span>
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {a.serviceNames.join(", ")}
                    {a.stylist ? ` · ${a.stylist}` : ""}
                  </td>
                  <td className="py-3">{money(Number(a.total_price))}</td>
                  <td className={`py-3 text-xs uppercase tracking-wide ${statusTone[a.status] ?? ""}`}>
                    {a.status}
                    <span className="block text-[10px] text-muted-foreground">
                      {a.payment_status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {a.status !== "CONFIRMED" && (
                        <button
                          className={chipClass}
                          onClick={() => mutation.mutate({ id: a.id, status: "CONFIRMED" })}
                        >
                          Confirm
                        </button>
                      )}
                      {a.status !== "COMPLETED" && (
                        <button
                          className={chipClass}
                          onClick={() =>
                            mutation.mutate({
                              id: a.id,
                              status: "COMPLETED",
                              paymentStatus: "PAID",
                            })
                          }
                        >
                          Complete
                        </button>
                      )}
                      {a.status !== "CANCELLED" && (
                        <button
                          className={chipClass}
                          onClick={() => mutation.mutate({ id: a.id, status: "CANCELLED" })}
                        >
                          Cancel
                        </button>
                      )}
                      <button className={chipClass} onClick={() => setActive(a)}>
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setActive(null)}
        >
          <div
            className="glass w-full max-w-lg rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-foreground">{active.customer_name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{active.customer_phone}</p>
            <dl className="mt-5 space-y-2 text-sm">
              <Row label="Services" value={active.serviceNames.join(", ")} />
              <Row label="Stylist" value={active.stylist ?? "Auto-assigned"} />
              <Row label="Total" value={money(Number(active.total_price))} />
              <Row label="Payment" value={active.payment_status} />
              <Row label="Notes" value={active.notes || "—"} />
            </dl>

            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-gold">Reschedule</p>
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                mutation.mutate({
                  id: active.id,
                  date: String(form.get("date")),
                  timeSlot: String(form.get("slot")),
                });
              }}
            >
              <input name="date" type="date" defaultValue={active.date} className={`${inputClass} sm:max-w-[170px]`} required />
              <select name="slot" defaultValue={active.time_slot} className={`${inputClass} sm:max-w-[150px]`}>
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button className="glow-cta rounded-xl px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Save
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"].map((p) => (
                <button
                  key={p}
                  className={chipClass}
                  onClick={() => mutation.mutate({ id: active.id, paymentStatus: p })}
                >
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
