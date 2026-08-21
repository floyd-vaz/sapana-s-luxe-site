import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { SALON } from "@/lib/salon";

const reviews = [
  {
    name: "Priyanka N.",
    text: "Got my hair rebonding done here and the results are stunning. Sapana ma'am and her team are so warm and patient — easily the best salon in Fatorda.",
    tag: "Hair Rebonding",
  },
  {
    name: "Reshma D.",
    text: "My bridal makeup lasted the whole day in Goa humidity. They did a trial first and matched the look exactly to my lehenga. Worth every rupee.",
    tag: "Bridal Makeup",
  },
  {
    name: "Anjali S.",
    text: "The hair spa is pure relaxation. Clean space, lovely music, and the staff genuinely care about hair health rather than upselling.",
    tag: "Hair Spa",
  },
  {
    name: "Fatima K.",
    text: "Tan removal facial before my sister's wedding gave me such a glow. Booking on WhatsApp was instant and they were right on time.",
    tag: "Facial & Tan Removal",
  },
];

export function Reviews() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setI((p) => (p + d + reviews.length) % reviews.length);
  };

  return (
    <section id="reviews" className="relative overflow-hidden px-6 py-28">
      <SectionHeading
        eyebrow="Loved in Madgaon"
        title="What Our Guests Say"
        subtitle={`${SALON.rating}★ average across ${SALON.reviews} Google reviews.`}
      />

      <div className="mx-auto mt-14 max-w-3xl" style={{ perspective: 1200 }}>
        <div className="relative min-h-[19rem] sm:min-h-[16rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, rotateY: dir * 35, x: dir * 60 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: -dir * 35, x: -dir * 60 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="glass absolute inset-0 rounded-3xl p-8 sm:p-12"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-6 font-display text-xl leading-relaxed sm:text-2xl">
                “{reviews[i].text}”
              </p>
              <footer className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="text-foreground">{reviews[i].name}</span>
                <span className="glass-soft rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">
                  {reviews[i].tag}
                </span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            aria-label="Previous review"
            onClick={() => go(-1)}
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {reviews.map((_, d) => (
              <button
                key={d}
                aria-label={`Review ${d + 1}`}
                onClick={() => {
                  setDir(d > i ? 1 : -1);
                  setI(d);
                }}
                className={`h-1.5 rounded-full transition-all ${d === i ? "w-8 bg-gold" : "w-3 bg-border"}`}
              />
            ))}
          </div>
          <button
            aria-label="Next review"
            onClick={() => go(1)}
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-gold"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
