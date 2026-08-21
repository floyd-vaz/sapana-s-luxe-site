import { motion } from "motion/react";
import { SectionHeading } from "./SectionHeading";
import hair from "@/assets/service-hair.jpg";
import skin from "@/assets/service-skin.jpg";
import bridal from "@/assets/service-bridal.jpg";
import nails from "@/assets/service-nails.jpg";

const services = [
  {
    img: hair,
    title: "Hair Care & Styling",
    items: "Rebonding · Smoothening · Global Colour · Hair Spa · Cuts",
    price: "from ₹799",
  },
  {
    img: skin,
    title: "Skin & Facials",
    items: "Glow Facials · Tan Removal · Clean-ups · De-Pigmentation",
    price: "from ₹599",
  },
  {
    img: bridal,
    title: "Bridal & Pre-Wedding",
    items: "HD Bridal Makeup · Engagement Looks · Pre-Bridal Packages",
    price: "from ₹6,999",
  },
  {
    img: nails,
    title: "Nails & Extensions",
    items: "Acrylic Extensions · Gel Polish · Pedicure & Manicure",
    price: "from ₹499",
  },
];

export function Services() {
  return (
    <section id="services" className="relative px-6 py-28">
      <SectionHeading
        eyebrow="Signature Menu"
        title="Popular Services"
        subtitle="Every treatment is delivered by trained stylists using premium professional products."
      />

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <motion.article
            key={s.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="glass group relative h-[26rem] overflow-hidden rounded-3xl"
          >
            <img
              src={s.img}
              alt={s.title}
              loading="lazy"
              width={1024}
              height={1280}
              className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="text-2xl text-gold-gradient">{s.title}</h3>
              <div className="max-h-0 overflow-hidden opacity-0 blur-sm transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100 group-hover:blur-0">
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.items}</p>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-gold">{s.price}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
