import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { SALON } from "@/lib/salon";

const links = [
  { href: "#services", label: "Services" },
  { href: "#transformations", label: "Results" },
  { href: "#reviews", label: "Reviews" },
  { href: "#visit", label: "Visit" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
        <a
          href={SALON.phoneHref}
          className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors hover:text-gold"
        >
          <Phone className="h-3.5 w-3.5 text-gold" />
          <span className="hidden sm:inline">Call Now</span>
        </a>
      </nav>
    </header>
  );
}
