import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { SALON, TIME_SLOTS } from "@/lib/salon";
import { useBookingAccess } from "@/hooks/use-booking-access";

const categories = [
  { key: "Hair Care & Styling", desc: "Rebonding, colour, spa, cuts" },
  { key: "Skin & Facials", desc: "Facials, tan removal, clean-ups" },
  { key: "Nails & Extensions", desc: "Acrylics, gel, mani & pedi" },
  { key: "Bridal & Pre-Wedding", desc: "HD bridal, trials, packages" },
];

const steps = ["Service", "Date & Time", "Your Details", "Confirm"];

export function Booking() {
  const withBookingAccess = useBookingAccess();
  const [step, setStep] = useState(0);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const canNext =
    (step === 0 && service) ||
    (step === 1 && date && slot) ||
    (step === 2 && name.trim() && phone.trim().length >= 8) ||
    step === 3;

  const whatsappUrl = `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(
    `Hello ${SALON.name}! I'd like to book an appointment.\n\nService: ${service}\nDate: ${date}\nTime: ${slot}\nName: ${name}\nPhone: ${phone}${notes ? `\nNotes: ${notes}` : ""}`,
  )}`;

  const field =
    "w-full rounded-xl border border-input bg-obsidian-soft/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold";

  return (
    <section id="book" className="px-6 py-28">
      <SectionHeading
        eyebrow="Reserve Your Seat"
        title="Book an Appointment"
        subtitle="Prior appointments required. Confirm instantly on WhatsApp — open daily 9:30 AM to 8:00 PM."
      />

      <div className="glass mx-auto mt-14 max-w-3xl rounded-3xl p-6 sm:p-10">
        <ol className="flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-colors ${
                  i <= step ? "glow-cta" : "glass-soft text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                {s}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="mt-10 min-h-[16rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => void withBookingAccess(() => setService(c.key))}
                      className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 ${
                        service === c.key
                          ? "border-gold bg-obsidian-soft/70 shadow-[var(--shadow-glow)]"
                          : "border-border bg-obsidian-soft/30"
                      }`}
                    >
                      <span className="block font-display text-xl text-gold-gradient">{c.key}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{c.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-gold">
                      Preferred date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={field}
                    />
                  </div>
                  <div>
                    <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-gold">
                      Time slot
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSlot(t)}
                          className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                            slot === t
                              ? "border-gold text-gold"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <input
                    className={field}
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="Phone number"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <textarea
                    className={`${field} min-h-28 resize-none`}
                    placeholder="Special notes (hair length, allergies, occasion…)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ["Service", service],
                      ["Date", date],
                      ["Time", slot],
                      ["Name", name],
                      ["Phone", phone],
                      ["Notes", notes || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="glass-soft rounded-xl px-4 py-3">
                        <dt className="text-[11px] uppercase tracking-[0.2em] text-gold">{k}</dt>
                        <dd className="mt-1 text-foreground">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="glow-cta inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.18em]"
                  >
                    <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
                  </a>
                  <p className="text-center text-xs text-muted-foreground">
                    Prefer to talk? Call us at{" "}
                    <a href={SALON.phoneHref} className="text-gold">
                      {SALON.phone}
                    </a>
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 3 && (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="glow-cta inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
