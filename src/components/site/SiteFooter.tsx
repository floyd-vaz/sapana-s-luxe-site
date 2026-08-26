import { MapPin, Phone, Clock, Navigation, CreditCard } from "lucide-react";
import { SALON } from "@/lib/salon";
import { BookAppointmentLink } from "./BookAppointmentLink";

export function SiteFooter() {
  return (
    <footer id="visit" className="border-t border-border/60 bg-obsidian-soft/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl text-gold-gradient">Visit the Studio</h2>
          <div className="gold-rule mt-6 w-32" />

          <ul className="mt-8 space-y-6 text-sm">
            <li className="flex gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <span className="text-muted-foreground">
                {SALON.address}
                <span className="mt-1 block text-xs">Plus Code: {SALON.plusCode}</span>
              </span>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <span className="text-muted-foreground">{SALON.hours}</span>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <a href={SALON.phoneHref} className="text-foreground transition-colors hover:text-gold">
                {SALON.phone}
              </a>
            </li>
            <li className="flex gap-4">
              <CreditCard className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <span className="text-muted-foreground">
                Google Pay · Credit Cards · Debit Cards · Cash
              </span>
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={SALON.directions}
              target="_blank"
              rel="noreferrer"
              className="glow-cta inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em]"
            >
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
            <BookAppointmentLink
              className="glass rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:text-gold"
            >
              Book Appointment
            </BookAppointmentLink>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-3xl">
          <iframe
            title="Map to Sapana's Touch of Class, Fatorda, Goa"
            src={SALON.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[24rem] w-full border-0 grayscale-[0.6] invert-[0.92] hue-rotate-180 lg:h-full"
          />
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SALON.name} · Women-owned premier beauty salon in Fatorda,
        Madgaon, Goa.
      </div>
    </footer>
  );
}
