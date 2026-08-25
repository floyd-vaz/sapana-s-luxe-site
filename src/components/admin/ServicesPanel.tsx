import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListServices, adminSaveService } from "@/lib/admin.functions";
import { Panel, chipClass, inputClass, money } from "./AdminShell";

type ServiceRow = {
  id: string;
  category: string;
  name: string;
  price: number;
  duration_min: number;
  description: string | null;
  active_status: boolean;
};

type Draft = {
  id?: string;
  category: string;
  name: string;
  price: string;
  durationMin: string;
  description: string;
  activeStatus: boolean;
};

const emptyDraft: Draft = {
  category: "",
  name: "",
  price: "",
  durationMin: "45",
  description: "",
  activeStatus: true,
};

export function ServicesPanel() {
  const listServices = useServerFn(adminListServices);
  const saveService = useServerFn(adminSaveService);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => listServices() as Promise<ServiceRow[]>,
  });

  const save = useMutation({
    mutationFn: (input: Draft) =>
      saveService({
        data: {
          ...(input.id ? { id: input.id } : {}),
          category: input.category,
          name: input.name,
          price: Number(input.price),
          durationMin: Number(input.durationMin),
          description: input.description,
          activeStatus: input.activeStatus,
        } as never,
      }),
    onSuccess: () => {
      toast.success("Service saved");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setDraft(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save"),
  });

  return (
    <Panel
      title="Service manager"
      action={
        <button className={chipClass} onClick={() => setDraft({ ...emptyDraft })}>
          Add service
        </button>
      }
    >
      {draft && (
        <form
          className="glass-soft mb-6 grid gap-3 rounded-2xl p-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(draft);
          }}
        >
          <input
            className={inputClass}
            placeholder="Category"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Service name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Price"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            required
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Duration (min)"
            value={draft.durationMin}
            onChange={(e) => setDraft({ ...draft, durationMin: e.target.value })}
            required
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.activeStatus}
              onChange={(e) => setDraft({ ...draft, activeStatus: e.target.checked })}
            />
            Bookable online
          </label>
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className={chipClass} onClick={() => setDraft(null)}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="glow-cta rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.2em] disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading services…</p>
      ) : (
        <ul className="space-y-2">
          {(data ?? []).map((s) => (
            <li
              key={s.id}
              className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm"
            >
              <div>
                <p className="text-foreground">
                  {s.name}{" "}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.category}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {money(Number(s.price))} · {s.duration_min} min ·{" "}
                  {s.active_status ? "Active" : "Hidden"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className={chipClass}
                  onClick={() =>
                    setDraft({
                      id: s.id,
                      category: s.category,
                      name: s.name,
                      price: String(s.price),
                      durationMin: String(s.duration_min),
                      description: s.description ?? "",
                      activeStatus: s.active_status,
                    })
                  }
                >
                  Edit
                </button>
                <button
                  className={chipClass}
                  onClick={() =>
                    save.mutate({
                      id: s.id,
                      category: s.category,
                      name: s.name,
                      price: String(s.price),
                      durationMin: String(s.duration_min),
                      description: s.description ?? "",
                      activeStatus: !s.active_status,
                    })
                  }
                >
                  {s.active_status ? "Disable" : "Enable"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
