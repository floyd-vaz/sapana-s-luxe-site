import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ArrowRight, ArrowLeft, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { SALON } from "@/lib/salon";
import { TIME_SLOTS } from "@/lib/booking.schemas";
import { listServices, getAvailability, createBooking } from "@/lib/booking.functions";
import { useBookingAccess } from "@/hooks/use-booking-access";

const steps = ["Service", "Date & Time", "Your Details", "Confirm"];

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type Booked = {
  id: string;
  totalPrice: number;
  stylist: string;
  serviceNames: string[];
  date: string;
  timeSlot: string;
};

export function Booking() {
  const withBookingAccess = useBookingAccess();
  const queryClient = useQueryClient();
  const fetchServices = useServerFn(listServices);
  const fetchAvailability = useServerFn(getAvailability);
  const submitBooking = useServerFn(createBooking);

  const [step, setStep] = useState(0);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState<Booked | null>(null);

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => fetchServices(),
  });

  const availability = useQuery({
    queryKey: ["availability", date],
    queryFn: () => fetchAvailability({ data: { date } }),
    enabled: Boolean(date),
  });

  const selected = services.filter((s) => serviceIds.includes(s.id));
  const total = selected.reduce((sum, s) => sum + Number(s.price), 0);

  const categories = Array.from(new Set(services.map((s) => s.category)));

  const today = new Date().toISOString().split("T")[0];
  const canNext =
    (step === 0 && serviceIds.length > 0) ||
    (step === 1 && date && slot) ||
    (step === 2 && name.trim().length >= 2 && phone.trim().length >= 8) ||
    step === 3;

  const mutation = useMutation({
    mutationFn: async () =>
      submitBooking({
        data: {
          serviceIds,
          date,
          timeSlot: slot as (typeof TIME_SLOTS)[number],
          name: name.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        },
      }),
    onSuccess: (result) => {
      setBooked({ ...result, date, timeSlot: slot });
      void queryClient.invalidateQueries({ queryKey: ["availability", date] });
      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : mutation.error ? "Booking failed" : null;

  function toggleService(id: string) {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 6 ? [...prev, id] : prev,
    );
  }

  function resetForm() {
    setBooked(null);
    setStep(0);
    setServiceIds([]);
    setDate("");
    setSlot("");
    setNotes("");
    mutation.reset();
  }

  const field =
    "w-full rounded-xl border border-input bg-obsidian-soft/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold";

  const whatsappUrl = `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(
    `Hello ${SALON.name}! I have a question about my appointment.`,
  )}`;

  if (booked) {
    return (
      <section id="book" className="px-6 py-28">
        <SectionHeading
          eyebrow="Confirmed"
          title="Your appointment is booked!"
          subtitle="We've saved your appointment. A confirmation email is on its way — no further action needed."
        />
        <div className="glass mx-auto mt-14 max-w-2xl rounded-3xl p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="glow-cta flex h-10 w-10 items-center justify-center rounded-full">
              <Check className="h-5 w-5" />
            </span>
            <p className="font-display text-2xl text-gold-gradient">Booking confirmed</p>
          </div>
          <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Services", booked.serviceNames.join(", ")],
              ["Stylist", booked.stylist],
              ["Date", booked.date],
              ["Time", booked.timeSlot],
              ["Total", money(Number(booked.totalPrice))],
              ["Reference", booked.id.slice(0, 8).toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} className="glass-soft rounded-xl px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-gold">{k}</dt>
                <dd className="mt-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold"
            >
              Book another appointment
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-gold"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Questions? Message us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="px-6 py-28">
      <SectionHeading
        eyebrow="Reserve Your Seat"
        title="Book an Appointment"
        subtitle="Prior appointments required. Your slot is confirmed instantly — open daily 9:30 AM to 8:00 PM."
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
                <div className="space-y-8">
                  {servicesLoading && (
                    <p className="text-sm text-muted-foreground">Loading services…</p>
                  )}
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
                        {category}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {services
                          .filter((s) => s.category === category)
                          .map((s) => (
                            <button
                              key={s.id}
                              onClick={() => void withBookingAccess(() => toggleService(s.id))}
                              className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 ${
                                serviceIds.includes(s.id)
                                  ? "border-gold bg-obsidian-soft/70 shadow-[var(--shadow-glow)]"
                                  : "border-border bg-obsidian-soft/30"
                              }`}
                            >
                              <span className="flex items-center justify-between gap-3">
                                <span className="font-display text-lg text-foreground">{s.name}</span>
                                <span className="text-sm text-gold">{money(Number(s.price))}</span>
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {s.duration_min} min{s.description ? ` · ${s.description}` : ""}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                  {serviceIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {serviceIds.length} selected · Total {money(total)}
                    </p>
                  )}
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
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSlot("");
                      }}
                      className={field}
                    />
                  </div>
                  <div>
                    <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-gold">
                      Time slot
                    </span>
                    {!date && (
                      <p className="text-xs text-muted-foreground">Pick a date to see open slots.</p>
                    )}
                    {date && availability.isLoading && (
                      <p className="text-xs text-muted-foreground">Checking availability…</p>
                    )}
                    {availability.data?.closed && (
                      <p className="text-xs text-rose-velvet">
                        Closed on this date{availability.data.reason ? ` — ${availability.data.reason}` : ""}.
                        Please pick another day.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(availability.data?.slots ?? []).map((s) => (
                        <button
                          key={s.slot}
                          disabled={!s.available}
                          onClick={() => setSlot(s.slot)}
                          className={`rounded-full border px-4 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through ${
                            slot === s.slot
                              ? "border-gold text-gold"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.slot}
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
                      ["Services", selected.map((s) => s.name).join(", ")],
                      ["Total", money(total)],
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

                  {errorMessage && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <span>
                        {errorMessage}
                        <button
                          onClick={() => {
                            mutation.reset();
                            setSlot("");
                            void availability.refetch();
                            setStep(1);
                          }}
                          className="ml-2 underline underline-offset-4 hover:text-gold"
                        >
                          Pick another date or time
                        </button>
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      void withBookingAccess(() => {
                        if (!mutation.isPending) mutation.mutate();
                      })
                    }
                    disabled={mutation.isPending}
                    className="glow-cta inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] disabled:opacity-60"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Confirm booking
                      </>
                    )}
                  </button>
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
            disabled={step === 0 || mutation.isPending}
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
