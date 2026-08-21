import { useRef, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { MoveHorizontal } from "lucide-react";
import before from "@/assets/before-hair.jpg";
import after from "@/assets/after-hair.jpg";

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <section id="transformations" className="px-6 py-28">
      <SectionHeading
        eyebrow="Real Results"
        title="Before & After"
        subtitle="Drag the handle to see a rebonding and gloss transformation done in our Fatorda studio."
      />

      <div
        ref={ref}
        className="glass relative mx-auto mt-14 aspect-[4/3] w-full max-w-4xl cursor-ew-resize select-none overflow-hidden rounded-3xl sm:aspect-[16/9]"
        onPointerDown={(e) => {
          dragging.current = true;
          move(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && move(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
      >
        <img
          src={after}
          alt="Hair after rebonding treatment"
          loading="lazy"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img
            src={before}
            alt="Hair before rebonding treatment"
            loading="lazy"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>

        <span className="glass-soft absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
          Before
        </span>
        <span className="glass-soft absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">
          After
        </span>

        <div className="absolute inset-y-0 w-px bg-gold" style={{ left: `${pos}%` }}>
          <span className="glow-cta absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
            <MoveHorizontal className="h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
}
