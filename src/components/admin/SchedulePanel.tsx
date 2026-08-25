import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  adminDeleteException,
  adminListExceptions,
  adminSaveException,
} from "@/lib/admin.functions";
import { TIME_SLOTS } from "@/lib/booking.schemas";
import { Panel, chipClass, inputClass } from "./AdminShell";

type ExceptionRow = {
  id: string;
  date: string;
  reason: string;
  is_full_day_block: boolean;
  blocked_slots: string[] | null;
};

export function SchedulePanel() {
  const listExceptions = useServerFn(adminListExceptions);
  const saveException = useServerFn(adminSaveException);
  const removeException = useServerFn(adminDeleteException);
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [fullDay, setFullDay] = useState(true);
  const [slots, setSlots] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "exceptions"],
    queryFn: () => listExceptions() as Promise<ExceptionRow[]>,
  });

  const save = useMutation({
    mutationFn: () =>
      saveException({
        data: {
          date,
          reason,
          isFullDayBlock: fullDay,
          blockedSlots: fullDay ? [] : slots,
        } as never,
      }),
    onSuccess: () => {
      toast.success("Schedule updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setDate("");
      setReason("");
      setSlots([]);
      setFullDay(true);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeException({ data: { id } }),
    onSuccess: () => {
      toast.success("Block removed");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not remove"),
  });

  return (
    <Panel title="Schedule & blackout manager">
      <form
        className="glass-soft grid gap-3 rounded-2xl p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <input
          className={inputClass}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Reason (holiday, maintenance…)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          <input
            type="checkbox"
            checked={fullDay}
            onChange={(e) => setFullDay(e.target.checked)}
          />
          Block the entire day
        </label>
        <div className="sm:justify-self-end">
          <button
            type="submit"
            disabled={save.isPending}
            className="glow-cta rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.2em] disabled:opacity-60"
          >
            Save block
          </button>
        </div>
        {!fullDay && (
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {TIME_SLOTS.map((slot) => {
              const on = slots.includes(slot);
              return (
                <button
                  type="button"
                  key={slot}
                  className={`${chipClass} ${on ? "text-gold" : ""}`}
                  onClick={() =>
                    setSlots(on ? slots.filter((s) => s !== slot) : [...slots, slot])
                  }
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}
      </form>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading blocked dates…</p>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">No blocked dates. Bookings run as usual.</p>
        ) : (
          <ul className="space-y-2">
            {data.map((e) => (
              <li
                key={e.id}
                className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-foreground">
                    {e.date} · {e.reason}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.is_full_day_block
                      ? "Full day closed"
                      : `Blocked: ${(e.blocked_slots ?? []).join(", ") || "none"}`}
                  </p>
                </div>
                <button className={chipClass} onClick={() => remove.mutate(e.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
