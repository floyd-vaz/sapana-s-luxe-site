import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SALON } from "@/lib/salon";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { href: "#services", label: "Services" },
  { href: "#transformations", label: "Results" },
  { href: "#reviews", label: "Reviews" },
  { href: "#visit", label: "Visit" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    async function load(user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) {
      if (!active) return;
      setSignedIn(Boolean(user));
      if (!user) {
        setIsAdmin(false);
        setDisplayName("");
        return;
      }
      const metadataName = user.user_metadata?.name ?? user.user_metadata?.full_name;
      setDisplayName(
        typeof metadataName === "string" && metadataName.trim()
          ? metadataName.trim().split(" ")[0]
          : (user.email?.split("@")[0] ?? "My account"),
      );
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setIsAdmin(Boolean(data));
    }
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      load(session?.user ?? null),
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);


  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid ? "glass" : ""}`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#home" className="font-display text-lg leading-tight text-gold-gradient">
          Sapana&apos;s <span className="block text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Touch of Class</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden rounded-full px-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-gold sm:inline"
            >
              Admin
            </Link>
          )}
          <Link
            to={signedIn ? "/bookings" : "/auth"}
            className="rounded-full px-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-gold"
          >
            {signedIn ? `${displayName} · Bookings` : "Sign in"}
          </Link>
          <a
            href={SALON.phoneHref}
            className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5 text-gold" />
            <span className="hidden sm:inline">Call Now</span>
          </a>
        </div>

      </nav>
    </header>
  );
}
