import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SALON } from "@/lib/salon";

export function AdminShell({
  eyebrow,
  title,
  children,
  showAdmin = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  showAdmin?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link to="/" className="font-display text-base text-gold-gradient">
            {SALON.name}
          </Link>
          <nav className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {showAdmin && (
              <Link to="/admin" className="transition-colors hover:text-gold">
                Admin
              </Link>
            )}
            <Link to="/bookings" className="transition-colors hover:text-gold">
              My bookings
            </Link>
            <button onClick={signOut} className="transition-colors hover:text-gold">
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-obsidian-soft/50 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold";

export const chipClass =
  "glass-soft rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors hover:text-gold";

export function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
