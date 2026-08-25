import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListClients } from "@/lib/admin.functions";
import { Panel, inputClass, money } from "./AdminShell";

export function ClientsPanel() {
  const listClients = useServerFn(adminListClients);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((c) =>
      [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <Panel title="Client registry">
      <input
        className={`${inputClass} sm:max-w-xs`}
        placeholder="Search name, email or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="mt-5 overflow-x-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading clients…</p>
        ) : !rows.length ? (
          <p className="text-sm text-muted-foreground">No clients found.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="py-2">Client</th>
                <th className="py-2">Contact</th>
                <th className="py-2">Visits</th>
                <th className="py-2">Spend</th>
                <th className="py-2">Last visit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-3 text-foreground">{c.name || "Guest"}</td>
                  <td className="py-3 text-muted-foreground">
                    <div>{c.phone || "—"}</div>
                    <div className="text-xs">{c.email || ""}</div>
                  </td>
                  <td className="py-3 text-muted-foreground">{c.visits}</td>
                  <td className="py-3 text-muted-foreground">{money(c.spend)}</td>
                  <td className="py-3 text-muted-foreground">{c.lastVisit ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}
