import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Amenities } from "@/components/site/Amenities";
import { Services } from "@/components/site/Services";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { Reviews } from "@/components/site/Reviews";
import { Booking } from "@/components/site/Booking";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SALON } from "@/lib/salon";

const title = "Best Salon in Fatorda | Sapana's Touch of Class, Madgaon Goa";
const description =
  "4.8★ women-owned beauty parlour in Fatorda, Madgaon Goa. Hair rebonding, colouring, facials, bridal makeup, hair spa & nail extensions. Book on WhatsApp.";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: SALON.name,
  telephone: "+917028577275",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Building No 1, Albanita Enclave, Shop No 2 & 3, Fatorda",
    addressLocality: "Madgaon",
    addressRegion: "Goa",
    postalCode: "403601",
    addressCountry: "IN",
  },
  openingHours: "Mo-Su 09:30-20:00",
  priceRange: "₹₹",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "150" },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "best salon in Fatorda, beauty parlour Madgaon Goa, hair salon near Albanita Enclave, bridal makeup Goa",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Amenities />
        <Services />
        <BeforeAfter />
        <Reviews />
        <Booking />
      </main>
      <SiteFooter />
    </div>
  );
}
