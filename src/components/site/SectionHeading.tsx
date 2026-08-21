import { motion } from "motion/react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-xs uppercase tracking-[0.35em] text-gold"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mt-4 text-4xl sm:text-5xl"
      >
        {title}
      </motion.h2>
      <div className="gold-rule mx-auto mt-6 w-40" />
      {subtitle && <p className="mt-5 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  );
}
