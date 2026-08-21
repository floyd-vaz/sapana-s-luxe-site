import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Star, Phone } from "lucide-react";
import heroImg from "@/assets/hero-salon.jpg";
import { SALON } from "@/lib/salon";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
    >
      <motion.img
        src={heroImg}
        alt="Interior of Sapana's Touch of Class salon in Fatorda, Goa"
        width={1920}
        height={1280}
        style={{ y }}
        className="absolute inset-0 h-[118%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
      <div
        className="absolute inset-0 opacity-90"
        style={{ background: "var(--gradient-velvet)" }}
      />

      {/* floating silk ribbon ornament */}
      <motion.div
        aria-hidden
        className="animate-float pointer-events-none absolute -right-24 top-1/4 hidden h-[26rem] w-[26rem] lg:block"
        style={{
          transform: `translate3d(${tilt.x * 40}px, ${tilt.y * 40}px, 0)`,
        }}
      >
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <defs>
            <linearGradient id="silk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.72 0.11 78)" stopOpacity="0.9" />
              <stop offset="55%" stopColor="oklch(0.55 0.22 348)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="oklch(0.92 0.07 95)" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <motion.path
              key={i}
              d={`M20 ${180 + i * 18} C 110 ${60 + i * 22}, 250 ${300 - i * 14}, 380 ${150 + i * 20}`}
              fill="none"
              stroke="url(#silk)"
              strokeWidth={2 + i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 2.4, delay: i * 0.25, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </motion.div>

      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 py-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] text-gold"
        >
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {SALON.reviews} 5-Star Reviews on Google
        </motion.div>

        <h1 className="mt-8 max-w-3xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
          {"Elevate Your Beauty at Goa's Premier Salon".split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.07 }}
              className="mr-3 inline-block text-gold-gradient"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          4.8★ Rated Salon in Fatorda, Madgaon · Women-Owned &amp; Crafted for Elegance
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#book"
            className="glow-cta rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.18em]"
          >
            Book Appointment
          </a>
          <a
            href="#services"
            className="glass rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:text-gold"
          >
            Explore Services
          </a>
          <a
            href={SALON.phoneHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <Phone className="h-4 w-4" /> {SALON.phone}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
