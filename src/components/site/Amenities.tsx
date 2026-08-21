import { Crown, Car, Wifi, CalendarCheck, Baby, Wallet, CreditCard } from "lucide-react";

const items = [
  { icon: Crown, label: "Women-Owned" },
  { icon: Car, label: "On-site Parking" },
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: CalendarCheck, label: "Appointment Only" },
  { icon: Baby, label: "Kid Friendly" },
  { icon: Wallet, label: "GPay Accepted" },
  { icon: CreditCard, label: "Cards & Cash" },
];

export function Amenities() {
  return (
    <section className="relative border-y border-border/60 bg-obsidian-soft/40 py-5">
      <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex shrink-0 items-center gap-12 pr-12">
          {[...items, ...items].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3">
              <span className="glass-soft flex h-10 w-10 items-center justify-center rounded-full">
                <Icon className="h-4 w-4 text-gold" />
              </span>
              <span className="whitespace-nowrap text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
